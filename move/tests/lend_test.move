#[test_only]
module tabfi::test_lend;

use sui::test_scenario as ts;
use sui::coin;
use tabfi::lend as l;
use usd::usdv::{Self, USDV};
use sui::clock;
use sui::dynamic_field as df;
// Alice is the borrower, Bob is the receiver
const Alice:address = @0x1;
const Bob:address = @0x2;
const Editor:address = @0x3;

// #[test_only]
// public fun test_coin(target: address) {
//   let coin = coin::mint_for_testing<SUI>(100, ts.ctx());
//   transfer::public_transfer(coin, target);
// }

#[test]
public fun test_lend() {
  let mut s = ts::begin(Editor);
  // init lend
  s.next_tx(Editor);
  l::test_init(s.ctx());
  // init usdv
  s.next_tx(Editor);
  usdv::test_init(s.ctx());
  // begin test
  s.next_tx(Editor);
  let mut treasury = s.take_from_sender<coin::TreasuryCap<USDV>>();
  usdv::mint_to(&mut treasury, 1_000_000_000, Alice, s.ctx());
  s.return_to_sender(treasury);
  // init clock
  let clock_test = clock::create_for_testing(s.ctx());
  let mut registry = s.take_shared<l::Registry>();
  // get and edit Credit
  s.next_tx(Bob);
  l::get_new_credit(s.ctx(), &mut registry);
  {
    s.next_tx(Editor);
    let modify = s.take_from_sender<l::ModifyCap>();
    l::set_credit(&modify, 1_000_000_000, Bob, &mut registry);
    let (_, _, max) = l::get_credit_data(Bob, &registry);
    assert!(max == 1_000_000_000, 1);
    s.return_to_sender(modify);
  };
  s.next_tx(Alice);
  let ucoin = s.take_from_sender<coin::Coin<USDV>>();
  let lend_id = {
    l::lend_to_others(s.ctx(), ucoin, Bob, 30*24*60*60*1000*2, &clock_test, &mut registry)
  };
  s.next_tx(Bob);
  {
    let bob_coin = s.take_from_sender<coin::Coin<USDV>>();
    l::repay(bob_coin, lend_id, &clock_test, &mut registry);
  };
  clock::destroy_for_testing(clock_test);
  l::delete_registry(registry);
  s.end();
}
