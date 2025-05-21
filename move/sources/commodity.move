module sales::commodity;

use tabfi::lend::{Self, Registry};
use usd::usdv;
use sui::coin::Coin;
use sui::dynamic_field as df;
use std::string::String;
use sui::clock::Clock;

public struct Shop has key {
  id: UID,
  owner: address,
}

public struct Commodity has key, store {
  id: UID,
  name: String,
  price: u64,
  description: String,
  image: String,
}

public struct CommodityCap has key {
  id: UID,
}

fun init(ctx: &mut TxContext) {
  transfer::transfer(CommodityCap { id: object::new(ctx) }, ctx.sender());
  transfer::share_object(Shop { id: object::new(ctx), owner: ctx.sender() });
}

public entry fun create_commodity(_: &CommodityCap, name: String, 
price: u64, description: String, image: String, shop: &mut Shop, ctx: &mut TxContext) {
  let uid = object::new(ctx);
  let id = uid.to_inner();
  let commodity = Commodity {
    id: uid,
    name,
    price,
    description,
    image,
  };
  df::add(&mut shop.id, id, commodity);
}

public fun remove_commodity(_: &CommodityCap, id: ID, shop: &mut Shop) {
  assert!(df::exists_(&shop.id, id), 0);
  let commodity = df::remove<ID,Commodity>(&mut shop.id, id);
  let Commodity{id: uid, ..} = commodity;
  object::delete(uid);
}

public entry fun buy_commodity(money: Coin<usdv::USDV>, shop: &mut Shop,
id: ID, registry: &mut Registry, deadline: u64, clock: &Clock, ctx: &mut TxContext) {
  assert!(df::exists_(&shop.id, id), 0);
  let commodity = df::borrow_mut<ID, Commodity>(&mut shop.id, id);
  transfer::public_transfer(Commodity{
    id: object::new(ctx),
    name: commodity.name,
    price: commodity.price,
    description: commodity.description,
    image: commodity.image,
  }, shop.owner);
  let _ = lend::lend_to_others(money, shop.owner, deadline, clock, registry, ctx);
}
