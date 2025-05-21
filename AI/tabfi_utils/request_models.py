from pydantic import BaseModel

class BalanceRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sui: bool

class CreditRequest(BaseModel):
    wallet_address: str
    use_sui: bool

class TXSRequest(BaseModel):
    wallet_address: str
    chain_id: int
    use_sui: bool

class NillionRequest(BaseModel):
    wallet_address: str
    credit_score: int
    risk_level: int

class RetrivalCreditRequest(BaseModel):
    wallet_address: str