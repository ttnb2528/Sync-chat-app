// import { compare } from "bcrypt";
import bcrypt from "bcryptjs"; 
import User from "../model/User.model.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";
import cloudinary from "../config/cloudinary.js";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Please provide email and password");
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashedPassword });
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Please provide email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Password incorrect");
    }

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).send("Please provide all fields");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

// export const addProfileImage = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send("Please provide an image");
//     }

//     const date = Date.now();
//     let fileName = "uploads/profiles/" + date + req.file.originalname;
//     renameSync(req.file.path, fileName);

//     const updateUser = await User.findByIdAndUpdate(
//       req.userId,
//       {
//         image: fileName,
//       },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       image: updateUser.image,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Internal Server Error");
//   }
// };

export const addProfileImage = async (req, res, next) => {
  console.log(req.body);
  const { imageFile } = req.body;

  try {
    if (!imageFile) {
      return res.status(400).send("Please provide an image");
    }

    const updateUser = await User.findByIdAndUpdate(
      req.userId,
      { image: imageFile },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      image: updateUser.image,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log("Cloudinary Config:", cloudinary.config());

    // if (user.image) {
    //   unlinkSync(user.image);
    // }

    // Lấy public_id từ URL
    // const public_id = user.image.split("/").slice(-2).join("/");
    // console.log(public_id);

    let parts = user.image.split("/");
    let fileName = parts[parts.length - 1].split(".")[0]; // Loại bỏ phần mở rộng .jpg
    let folder = parts[parts.length - 2];

    let public_id = folder + "/" + fileName;
    console.log(public_id);

    const response = await cloudinary.uploader.destroy(public_id);

    console.log("Delete result:", response);

    user.image = null;
    await user.save();

    return res.status(200).send("Image removed successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 1,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).send("Logged out successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
