const _ = require("lodash");
const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();
// CREATE
router.post("/", verifyToken, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  const product = _.pick(req.body, ["productId", "quantity", "color", "size"]);
  if (cart) {
    cart = await Cart.updateOne(
      { _id: cart._id },
      {
        $push: {
          products: product,
        },
      }
    );
  } else {
    cart = await Cart.create({
      userId: req.user.id,
      products: [product],
    });
  }
  res.status(200).send(cart);
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});
//  DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/", verifyToken, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (cart) {
    await Cart.deleteOne({ userId: req.user.id });
  }
  res.status(200).send({ message: "Success" });
});

//  GET USER CART
router.get("/find", verifyToken, async (req, res) => {
  console.log(req.user)
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    res.status(200).json(cart?.products || []);
  } catch (err) {
    res.status(500).json(err);
  }
});
//  GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
