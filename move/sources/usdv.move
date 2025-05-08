module usd::usdv;

use sui::coin::{Self, TreasuryCap};

public struct USDV has drop {}

fun init(witness: USDV, ctx: &mut TxContext) {
  let (treasury, metadata) = coin::create_currency(
				witness,
				6,
				b"USDV",
				b"USDV",
				b"TABFI STABLE COIN",
				option::none(),
				ctx,
		);
		transfer::public_freeze_object(metadata);
		transfer::public_transfer(treasury, ctx.sender());
}

public fun mint_to<T>(cap: &mut TreasuryCap<T>, value: u64, target: address, ctx: &mut TxContext) {
    coin::mint_and_transfer(cap, value, target, ctx);
}

#[test_only]
use sui::test_scenario as ts;
#[test_only]
use sui::coin::Coin;
#[test_only]
const Alice: address = @0x1;
#[test_only]
const Bob: address = @0x2;
#[test_only]
public fun test_init(ctx: &mut TxContext){
  init(USDV {}, ctx);
}

#[test]
public fun test_mint(){
  let mut s = ts::begin(Alice);
  test_init(s.ctx());
  s.next_tx(Alice);
  {
    let mut treasure = s.take_from_sender<TreasuryCap<USDV>>();
    coin::mint_and_transfer(&mut treasure, 1_000_000, Bob, s.ctx());
    s.return_to_sender(treasure);
  };
  s.next_tx(Bob);
  {
    let coinU: Coin<USDV> = s.take_from_sender();
    assert!(coin::value(&coinU) == 1_000_000, 1);
    s.return_to_sender(coinU);
  };
  s.end();
}