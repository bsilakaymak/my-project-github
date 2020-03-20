const express = require("express");
const { check } = require("express-validator");
const route = express.Router();
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const placessControllers = require("../controllers/places-controller");

route.get("/:pid", placessControllers.getPlaceById);
route.get("/user/:uid", placessControllers.getPlacesByUserId);
route.get("/user/:uid/mybucketlist", placessControllers.getBucketListByUserId);
route.use(checkAuth);
route.patch("/user/:pid/", placessControllers.addToBucketList);
route.post(
  "/",
  fileUpload.single("image"),
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address")
      .not()
      .isEmpty()
  ],
  placessControllers.createPlace
);

route.patch(
  "/:pid",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placessControllers.updatePlaceById
);
route.patch("/user/:uid/mybucketlist", placessControllers.visitedPlace)
route.delete("/:pid", placessControllers.deletePlaceById);
route.delete("/user/:pid/", placessControllers.deleteFromBucketList)
module.exports = route;
