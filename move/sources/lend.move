module tabfi::lend;

use sui::table::{Self, Table};
use sui::coin;
use sui::event;
use usd::usdv;
use sui::clock::Clock;
// structs
public struct Credit has key{
  id: UID,
  receiver: address,
  current: u64,
  max: u64,
}

public struct Lend has key{
  id: UID,
  borrower: address,
  receiver: address,
  amountToPay: u64,
  amountAlreadyPaid: u64,
  deadline: u64
}

public struct Registry has key{
  id: UID,
  table: Table<address, bool>,
  owner: address
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

// ErrorCodes
const ENOT_REGISTERED: u64 = 1;
const ENOT_ENOUGH_CREDIT: u64 = 2;
// const ENOT_ENOUGH_BALANCE: u64 = 3;
const ENOT_ENOUGH_TIME: u64 = 4;
const ENOT_ENOUGH_AMOUNT: u64 = 5;
const ENOT_ADMIN: u64 = 6;

const Admin: address = @0xa0926a353d046319404621ff7a859a5a2cd0150ffe596781e51516526212b199;
// init
fun init(ctx: &mut TxContext){
  let registry = Registry{
    id: object::new(ctx),
    table: table::new<address, bool>(ctx),
    owner: ctx.sender()
  };
  transfer::share_object(registry);
}
// write functions
// credit functions
public fun getCredit(ctx: &mut TxContext, registry: &mut Registry){
  assert!(!registry.table.contains(ctx.sender()), ENOT_REGISTERED);
  let credit = Credit{
    id: object::new(ctx),
    receiver: ctx.sender(),
    current: 0,
    max: 0
  };
  registry.table.add(ctx.sender(), true);
  transfer::share_object(credit);
}

public fun setCredit(ctx: &mut TxContext, newCredit: u64, curCredit: &mut Credit, registry: &mut Registry){
    assert!(ctx.sender() == registry.owner, ENOT_ADMIN);
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
public fun lendToOthers(ctx: &mut TxContext, money: coin::Coin<usdv::USDV>, credit: &mut Credit,
deadline: u64, clock: &Clock){
  let Credit{id: _, receiver, current, max} = credit;
  let amount = coin::value(&money);
  assert!(amount+*current <= *max, ENOT_ENOUGH_CREDIT);
  assert!(clock.timestamp_ms() <= deadline, ENOT_ENOUGH_TIME);
  let lend = Lend{
    id: object::new(ctx),
    borrower: ctx.sender(),
    receiver: *receiver,
    amountToPay: amount,
    amountAlreadyPaid: 0,
    deadline: deadline
  };
  credit.current = amount+*current;
  transfer::public_transfer(money, *receiver);
  transfer::share_object(lend);
  event::emit(LendEvent{
    borrower: ctx.sender(),
    receiver: *receiver,
    amount: amount,
    deadline: deadline
  });
}

public fun repay(money: coin::Coin<usdv::USDV>, 
lend: &mut Lend, credit: &mut Credit, clock: &Clock){
  let Lend{id:_, borrower, receiver:_, amountToPay, amountAlreadyPaid, deadline} = lend;
  let amount = coin::value(&money);
  assert!(amount+*amountAlreadyPaid <= *amountToPay, ENOT_ENOUGH_AMOUNT);
  assert!(clock.timestamp_ms() <= *deadline, ENOT_ENOUGH_TIME);
  lend.amountAlreadyPaid = amount+*amountAlreadyPaid;
  credit.current = credit.current-amount;
  
  transfer::public_transfer(money, *borrower);
}

// read functions
public fun getLendData(lend: &Lend): (address, address, u64, u64, u64){
  let Lend{id:_, borrower, receiver, amountToPay, amountAlreadyPaid, deadline} = lend;
  (*borrower, *receiver, *amountToPay, *amountAlreadyPaid, *deadline)
}

public fun getCreditData(credit: &Credit): (address, u64, u64){
  let Credit{id:_, receiver, current, max} = credit;
  (*receiver, *current, *max)
}

public fun getRegisterData(ctx: &mut TxContext, registry: &mut Registry): bool{
  registry.table.contains(ctx.sender())
}

#[test_only]
public fun test_init(ctx: &mut TxContext){
  init(ctx);
}

#[test_only]
public fun delete_lend(lend: Lend){
  object::delete(lend.id);
}

#[test_only]
public fun delete_credit(credit: Credit){
  object::delete(credit.id);
}

#[test_only]
public fun delete_registry(registry: Registry){
  object::delete(registry.id);
}
