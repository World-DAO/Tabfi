#[test_only]
module tabfi::test_lend;

use sui::test_scenario as ts;
use sui::coin;
use tabfi::lend as l;
use usd::usdv::{Self, USDV};
use sui::clock;

// Alice is the borrower, Bob is the receiver
const Alice:address = @0x1;
const Bob:address = @0x2;
const Editor:address = @0xa0926a353d046319404621ff7a859a5a2cd0150ffe596781e51516526212b199;

// #[test_only]
// public fun test_coin(target: address) {
//   let coin = coin::mint_for_testing<SUI>(100, ts.ctx());
//   transfer::public_transfer(coin, target);
// }

#[test]
public fun test_lend() {
  let mut s = ts::begin(Alice);
  // init lend
  s.next_tx(Editor);
  l::test_init(s.ctx());
  // init usdv
  usdv::test_init(s.ctx());
  s.next_tx(Alice);
  let mut treasury = s.take_from_sender<coin::TreasuryCap<USDV>>();
  usdv::mint_to(&mut treasury, 1_000_000_000, Alice, s.ctx());
  let ucoin = s.take_from_sender<coin::Coin<USDV>>();
  s.return_to_sender(treasury);
  // init clock
  let clock_test = clock::create_for_testing(s.ctx());
  let mut registry = s.take_shared<l::Registry>();
  // get and edit Credit
  s.next_tx(Bob);
  l::getCredit(s.ctx(), &mut registry);
  let mut credit = s.take_shared<l::Credit>();
  {
    s.next_tx(Editor);
    l::setCredit(s.ctx(), 1_000_000_000, &mut credit);
    let (_, _, max) = l::getCreditData(&credit);
    assert!(max == 1_000_000_000, 1);
  };
  s.next_tx(Alice);
  {
    l::lendToOthers(s.ctx(), ucoin, &mut credit, 1_000, &clock_test);
  };
  s.next_tx(Bob);
  {
    let mut lend = s.take_shared<l::Lend>();
    let bob_coin = s.take_from_sender<coin::Coin<USDV>>();
    l::repay(bob_coin, &mut lend, &mut credit, &clock_test);
    l::delete_lend(lend);
  };
  clock::destroy_for_testing(clock_test);
  l::delete_registry(registry);
  l::delete_credit(credit);
  s.end();
}
