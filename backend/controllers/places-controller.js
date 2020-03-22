const mongoose = require("mongoose");
const fs = require("fs");
const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../model/place");
const User = require("../model/user");
const cloudinary = require("../uploads/cloudinary");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    const place = await Place.findById(placeId);
    if (!place)
      return next(
        new HttpError("Could not find a place for the provided id.", 404)
      );

    res.json({ place: place.toObject({ getters: true }) });
  } catch (error) {
    return next(
      new HttpError("Somthing went wrong, could not find a place.", 500)
    );
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
    if (!userWithPlaces || userWithPlaces.places.length === 0)
      return next(
        new HttpError("Could not find a place for the provided user id.", 404)
      );

    res.json({
      userWithPlaces: userWithPlaces.places.map(place =>
        place.toObject({ getters: true })
      )
    });
  } catch (error) {
    return next(
      new HttpError(
        "Somthing went wrong, could not find a place for the provided id.",
        500
      )
    );
  }
};

const getBucketListByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithBucketList;
  try {
    userWithBucketList = await User.findById(userId).populate("bucketList.id");
    if (!userWithBucketList || userWithBucketList.bucketList.length === 0)
      return next(
        new HttpError(
          "Could not find a bucket list for the provided user id.",
          404
        )
      );

    res.json({
      userWithBucketList: userWithBucketList.bucketList.toObject({
        getters: true
      })
    });
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong, could not find a place for the provided id.",
        500
      )
    );
  }
};

const addToBucketList = async (req, res, next) => {
  const placeId = req.params.pid;
  let placeForBucket;
  try {
    placeForBucket = await Place.findById(placeId).populate("creator");
    if (!placeForBucket) {
      return next(
        new HttpError(`Could not find a place  for the provided place id.`, 404)
      );
    }
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong, could not find a place for the provided id.",
        500
      )
    );
  }
  const userId = req.userData.userId;
  let currentUser;
  try {
    currentUser = await User.findById(userId);
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong, could not find a user for the provided id.",
        500
      )
    );
  }

  const newBucketItem = {
    id: placeForBucket.id,
    createdBy: placeForBucket.creator.name,
    isVisited: false
  };
  const nonUniqueArray = currentUser.bucketList.filter(item => {
    return item.id == placeForBucket.id;
  });

  const checkUnique = () => {
    if (nonUniqueArray.length > 0) {
      return false;
    } else {
      return true;
    }
  };
  const isUnique = checkUnique();

  if (!isUnique) {
    const error = new Error("You cannot add the place with provided id", 401);
    return next(error);
  }

  if (placeForBucket.creator != req.userData.userId && isUnique) {
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      currentUser.bucketList.push(newBucketItem);
      await currentUser.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError("Adding place failed, place try again.", 500);
      return next(error);
    }
  } else {
    const error = new Error(
      "You cannot add your own places to you bucket list",
      401
    );
    return next(error);
  }
  res.json({
    addedPlace: placeForBucket
  });
};

const deleteFromBucketList = async (req, res, next) => {
  const placeId = req.params.pid;
  const userId = req.userData.userId;
  if (req.userData.userId == userId) {
    try {
      currentUser = await User.findById(userId);
      await currentUser.bucketList.pull({ id: placeId });
      await currentUser.save();
    } catch (error) {
      return next(new HttpError(`${error}`, 500));
    }
    res.status(200).json({ message: "place deleted from bucket list" });
  } else {
    return next(new Error("You are not authorized to delete this place", 401));
  }
};

const visitedPlace = async (req, res, next) => {
  const userId = req.userData.userId;
  const placeId = req.body.placeId;

  let currentUser;
  try {
    currentUser = await User.findById(userId);
    const currentBucket = currentUser.bucketList;
    const currentItem = currentBucket.find(item => item.id == placeId);
    currentItem.isVisited = req.body.isVisited;
    await currentUser.save();
  } catch (error) {
    return next(error);
  }
  res.send({ message: "Place visited" });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty())
    return next(
      new Error("Invalid input passed, please check your data.", 422)
    );

  const { title, description, address } = req.body;
  // Here I change the coordinatis to object and also reverse the lng becaouse I useed the mapbox  geocode by default it geve us an array [lat, lng].
  let changeCoordinates;
  let coordinates;
  try {
    changeCoordinates = await getCoordsForAddress(address);
    coordinates = {
      lat: changeCoordinates[1],
      lng: changeCoordinates[0]
    };
  } catch (error) {
    return next(error);
  }
  // upload the image first to the cloudinary
  const result = await cloudinary.uploader.upload(req.file.path);
  // I get the image info from the cloudinary and i storage it on mongodb as a string
  const { url, public_id } = result;
  const imageSrc = {
    imageUrl: url,
    id: public_id
  };
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: imageSrc,
    creator: req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try agen", 500));
  }

  if (!user)
    return next(new HttpError("Could not find user for provided id!", 404));

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
    res.status(201).json({ place: createdPlace });
  } catch (err) {
    const error = new HttpError("Create place failed, place try agin.", 500);
    return next(error);
  }
};

const updatePlaceById = async (req, res, next) => {
  const { title, description } = req.body;

  const error = validationResult(req);
  if (!error.isEmpty())
    return next(
      new Error("Invalid input passed, please check your data.", 422)
    );

  const placeId = req.params.pid;

  try {
    const place = await Place.findById(placeId);
    if (!place)
      return next(
        new HttpError("Could not find a place for the provided  id.", 404)
      );
    if (place.creator.toString() !== req.userData.userId) {
      return next(
        new HttpError("You are not allowed to edit this place.", 401)
      );
    }

    place.title = title;
    place.description = description;
    place.save();

    res.status(200).json({ place: place.toObject({ getters: true }) });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place", 500)
    );
  }
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place)
    return next(new HttpError("Could not find a place for the id.", 404));

  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this place.", 403)
    );
  }
  // Delete the image first from cloudinary by id
  const public_id = place.image.id;
  cloudinary.uploader.destroy(public_id, function(error, result) {
    if (error)
      throw new HttpError("Something went wrong, could not delete image.", 500);
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await User.updateMany(
      { "bucketList.id": placeId },
      { $pull: { bucketList: { id: placeId } } }
    );
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError(`${error}`, 500));
  }

  res.status(200).json({ message: "Place deleted" });
};

module.exports = {
  addToBucketList,
  getBucketListByUserId,
  deleteFromBucketList,
  visitedPlace,
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlaceById
};
