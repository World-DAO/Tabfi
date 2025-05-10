module tabfi::lend;

use sui::coin;
use sui::event;
use usd::usdv;
use sui::clock::Clock;
use sui::dynamic_field as df;
// structs
public struct ModifyCap has key{
  id: UID,
}

public struct Credit has key, store{
  id: UID,
  receiver: address,
  current: u64,
  max: u64,
}

public struct Lend has key, store{
  id: UID,
  borrower: address,
  receiver: address,
  amountToPay: u64,
  amountAlreadyPaid: u64,
  deadline: u64
}

public struct Registry has key{
  id: UID,
}

// events
public struct LendEvent has copy, drop{
  borrower: address,
  receiver: address,
  amount: u64,
  deadline: u64
}

public struct ModifyCreditEvent has copy, drop{
  receiver: address,
  preCredit: u64,
  curCredit: u64
}

public struct RepayEvent has copy, drop{
  lendId: ID,
  amount: u64,
  timestamp: u64
}

// ErrorCodes
const ENOT_REGISTERED: u64 = 1;
const ENOT_ENOUGH_CREDIT: u64 = 2;
// const ENOT_ENOUGH_BALANCE: u64 = 3;
const ENOT_ENOUGH_TIME: u64 = 4;
const ENOT_ENOUGH_AMOUNT: u64 = 5;

const MONTH: u64 = 30 * 24 * 60 * 60 * 1000;
// init
fun init(ctx: &mut TxContext){
  let registry = Registry{
    id: object::new(ctx),
  };
  transfer::share_object(registry);
  transfer::transfer(ModifyCap{id: object::new(ctx)}, ctx.sender());
}
// write functions
// credit functions
public fun get_new_credit(ctx: &mut TxContext, registry: &mut Registry){
  assert!(!df::exists_(&registry.id, ctx.sender()), ENOT_REGISTERED);
  let credit = Credit{
    id: object::new(ctx),
    receiver: ctx.sender(),
    current: 0,
    max: 0
  };
  df::add(&mut registry.id, ctx.sender(), credit);
}

public fun set_credit(_: &ModifyCap, newCredit: u64, target: address, registry: &mut Registry){
    let curCredit: &mut Credit = df::borrow_mut(&mut registry.id, target);
    assert!(newCredit >= curCredit.current, ENOT_ENOUGH_CREDIT);
    let preCredit = curCredit.max;
    curCredit.max = newCredit;
    event::emit(ModifyCreditEvent{
        receiver: curCredit.receiver,
        preCredit: preCredit,
        curCredit: newCredit,
    });
}

// lend functions
public fun lend_to_others(ctx: &mut TxContext, money: coin::Coin<usdv::USDV>, target: address,
deadline: u64, clock: &Clock, registry: &mut Registry):ID{
  assert!(df::exists_(&registry.id, target), ENOT_REGISTERED);
  let credit: &mut Credit = df::borrow_mut(&mut registry.id, target);
  let amount = coin::value(&money);
  assert!(amount+credit.current <= credit.max, ENOT_ENOUGH_CREDIT);
  assert!(clock.timestamp_ms()+MONTH <= deadline, ENOT_ENOUGH_TIME);
  let lend = Lend{
    id: object::new(ctx),
    borrower: ctx.sender(),
    receiver: target,
    amountToPay: amount,
    amountAlreadyPaid: 0,
    deadline: deadline
  };
  credit.current = amount+credit.current;
  transfer::public_transfer(money, target);
  let lend_id = lend.id.to_inner();
  df::add(&mut registry.id, lend_id, lend);
  event::emit(LendEvent{
    borrower: ctx.sender(),
    receiver: target,
    amount: amount,
    deadline: deadline
  });
  lend_id
}

public fun repay(money: coin::Coin<usdv::USDV>, lendId: ID, clock: &Clock, registry: &mut Registry){
  let amount = coin::value(&money);
  let (borrower, receiver) = {
    let lend: &mut Lend = df::borrow_mut(&mut registry.id, lendId);
    assert!(amount+lend.amountAlreadyPaid <= lend.amountToPay, ENOT_ENOUGH_AMOUNT);
    lend.amountAlreadyPaid = amount+lend.amountAlreadyPaid;
    (lend.borrower, lend.receiver)
  };
  let credit: &mut Credit = df::borrow_mut(&mut registry.id, receiver);
  credit.current = credit.current-amount;
  transfer::public_transfer(money, borrower);
  event::emit(RepayEvent{
    lendId: lendId,
    amount: amount,
    timestamp: clock.timestamp_ms()
  });
}

// read functions
public fun get_lend_data(id: ID, registry: &Registry): (address, address, u64, u64, u64){
  let lend: &Lend = df::borrow(&registry.id, id);
  (lend.borrower, lend.receiver, lend.amountToPay, lend.amountAlreadyPaid, lend.deadline)
}

public fun get_credit_data(target: address, registry: &Registry): (address, u64, u64){
  assert!(df::exists_(&registry.id, target), ENOT_REGISTERED);
  let credit: &Credit = df::borrow(&registry.id, target);
  (credit.receiver, credit.current, credit.max)
}

#[test_only]
public fun test_init(ctx: &mut TxContext){
  init(ctx);
}

#[test_only]
public fun delete_registry(registry: Registry){
  let Registry{id} = registry;
  object::delete(id);
}
