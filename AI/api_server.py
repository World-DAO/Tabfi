from fastapi import FastAPI
from contextlib import asynccontextmanager
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import asyncio
import httpx
from typing import List, Dict
from loguru import logger
import re
from datetime import datetime


# ======= Custom modules =======
from tabfi_agent import (
    BkokAgent, 
    BkokPromptHub,
    AgentResponse,
    NillionManager,
    step_agent_async,
    create_bkok_nillion_agent_wrapper,
    g_nlm_storage, g_user_storage
)
from tabfi_utils import (
    BalanceRequest,
    CreditRequest,
    TXSRequest,
    NillionRequest,
    RetrivalCreditRequest,
    warp_explorer_url,
    get_tx_brief
)

openai_api_key = None
openai_model_name = None
openai_base_url = None

explorer_api_key = None

aclient: AsyncOpenAI = None
bkok_prompt_hub: BkokPromptHub = None

g_eval_time_utc: Dict[str, datetime] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    global openai_api_key, openai_model_name, openai_base_url, aclient, explorer_api_key, bkok_prompt_hub
    openai_api_key = os.getenv("OPENAI_API_KEY", "5a85844c9763640eddc40419e1ffef29.NMNgVsNfgIf3RT3Z")
    openai_model_name = os.getenv("OPENAI_MODEL_NAME", "glm-4-flash")
    openai_base_url = os.getenv("OPENAI_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")

    explorer_api_key = os.getenv("explorer_API_KEY")

    bkok_prompt_hub = BkokPromptHub()

    aclient = AsyncOpenAI(api_key=openai_api_key, base_url=openai_base_url)
    try:
        yield
    finally:
        pass
    # do something here

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"status": "OK", 
            "message": """This server is for Bankok 2025 ETH hackathon, and do not have a front end.
You may refer to `/docs` to see the detail."""}

@app.post("/api/txs")
async def get_txs(request: TXSRequest):
    global explorer_api_key
    wallet_address = request.wallet_address
    wallet_address = wallet_address.lower()
    chain_id = request.chain_id
    use_sui = request.use_sui

    if use_sui:
        explorer_bls_url = warp_explorer_url(wallet_address, explorer_api_key=explorer_api_key, use_sui=True,
                                           action="balance")
        explorer_txs_url = warp_explorer_url(wallet_address, explorer_api_key=explorer_api_key, use_sui=True,
                                           action="txlist")
    else:
        explorer_bls_url = warp_explorer_url(wallet_address, explorer_api_key=explorer_api_key, chain_id=chain_id, 
                                           use_sui=False, action="balance")
        explorer_txs_url = warp_explorer_url(wallet_address, explorer_api_key=explorer_api_key, chain_id=chain_id, 
                                           use_sui=False, action="txlist")
        
    async with httpx.AsyncClient() as client:
        response = await client.get(explorer_bls_url)
        response.raise_for_status()
        data = response.json()
        balance = data.get("result")

    async with httpx.AsyncClient() as client:
        response = await client.get(explorer_txs_url)
        response.raise_for_status()
        data = response.json()
        txs = data.get("result")

    rt_dict = {"wallet": wallet_address, "balance": balance, "txs": []}
    tx_addr_mapping = {}
    if isinstance(txs, str):
        print(txs)
        return f"Error: {txs}"
    for i, tx in enumerate(txs):
        tx_info = get_tx_brief(tx, wallet_address)
        from_addr = tx_info['from_wallet']
        to_addr = tx_info['to_wallet']

        tx_type = ""
        if i == 0:
            # print(f"from_addr: {from_addr}, wallet_address: {wallet_address}")
            if from_addr == wallet_address:
                tx_addr_mapping[from_addr] = f"WALLET_Self"     # record itself as the first address
                tx_addr_mapping[to_addr] = f"WALLET_{i+2}"     # record the other
                tx_type = "out"
            else:
                tx_addr_mapping[to_addr] = f"WALLET_Self"     # record the other
                tx_addr_mapping[from_addr] = f"WALLET_{i+2}" 
                tx_type = "in"
        else:
            tx_type = "out" if from_addr == wallet_address else "in"
            if tx_type == "out":
                if to_addr not in tx_addr_mapping:
                    tx_addr_mapping[to_addr] = f"WALLET_{i+2}"
            else:
                if from_addr not in tx_addr_mapping:
                    tx_addr_mapping[from_addr] = f"WALLET_{i+2}"

        tx_info['from_wallet'] = tx_addr_mapping.get(from_addr, from_addr)
        tx_info['to_wallet'] = tx_addr_mapping.get(to_addr, to_addr)
        tx_info['type'] = tx_type

        if tx_info['amount'] == "0 ETH" or tx_info['amount'] == "0.0000000 ETH":
            continue
        else:
            rt_dict["txs"].append(tx_info)

    return rt_dict

@app.post("/api/eval_wallet")
async def eval_wallet(request: CreditRequest):
    global bkok_prompt_hub, g_eval_time_utc
    wallet_address = request.wallet_address
    use_sui = request.use_sui

    last_eval_time_utc: str = datetime(1970, 1, 1, 0, 0, 0)
    if wallet_address in g_eval_time_utc:
        last_eval_time_utc = g_eval_time_utc[wallet_address]

    # last_eval_time_utc = datetime.fromtimestamp(int(last_eval_time))

    url_prefix = "https://api-sui.explorer.io/api?"

    # ========= Launch Agent query & evaluate ==========
    res_dict = await step_agent_async(url_prefix=url_prefix, 
                                      wallet_address=wallet_address,
                                      last_eval_time_utc=last_eval_time_utc)
    summary: str = res_dict.get("final_summary")
    valid_ans: bool = True
    try:
        matches = re.findall(r"\+ (\w+): (\d+)", summary)
        ai_eval_result = {key: int(value) for key, value in matches}
    except Exception as e:
        logger.error(f"Failed to parse AI evaluation result: {e}")
        valid_ans = False
    finally:

        if 'credit' not in ai_eval_result or 'risk' not in ai_eval_result or not isinstance(ai_eval_result['credit'], int) or not isinstance(ai_eval_result['risk'], int):
            valid_ans = False

    rt_dict = {"status": "OK"}

    # ========= Error handling, retry if necessary ======
    if not valid_ans:
        try:
            logger.warning(f"Invalid AI evaluation result, retrying...")
            res_dict = await step_agent_async(url_prefix=url_prefix, wallet_address=wallet_address,
                                              last_eval_time_utc=last_eval_time_utc) # retry
            summary: str = res_dict.get("final_summary")
            matches = re.findall(r"\+ (\w+): (\d+)", summary)
            ai_eval_result = {key: int(value) for key, value in matches}
        except Exception as e:
            logger.error(f"Failed to parse AI evaluation result: {e}")
            rt_dict.update(res_dict)
            rt_dict.update({"credit": -1, "risk": -1})
            return rt_dict
    
    # ========= END Agent module =========
    rt_dict.update(res_dict)
    rt_dict.update(ai_eval_result)

    # ========= Mathematical calculation ==========
    g_eval_time_utc[wallet_address] = datetime.now()    

    return rt_dict


@app.post("/api/nillion_compute")
async def nillion_compute(request: NillionRequest):
    user_address = request.wallet_address
    credit_score = request.credit_score
    risk_level = request.risk_level

    global bkok_prompt_hub

    nillion_agent = create_bkok_nillion_agent_wrapper(
        agent_name="Storage_Compute_Agent",
        agent_instruction=bkok_prompt_hub.nillion_agent_instruction("exec_nillion_func"),
        user_address=user_address,
        debug=True
    )

    agent_res: AgentResponse = nillion_agent.run(
        [{"role": "user", "content": f"The merchant's credit score is: {credit_score}, and risk level is: {risk_level}, compute the new limit for me."}]
    )
    return {"content": agent_res.assistant_messages}


@app.post("/api/retrival_credit")
async def retrival_credit(request: RetrivalCreditRequest):
    global g_nlm_storage, g_user_storage
    wallet_address = request.wallet_address

    if wallet_address not in g_nlm_storage:
        return {"content": "wallet address not exist in AI backend, please evaluate first!"}

    store_id = g_user_storage[wallet_address]
    nlm: NillionManager = g_nlm_storage[wallet_address]
    int_credit_score = await nlm.retrieve_secret_integer(store_id=store_id, secret_name="old_credit")
    return {"content": int_credit_score / 100}