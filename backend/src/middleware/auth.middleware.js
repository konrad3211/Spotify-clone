import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  try {
    const auth = await req.auth();

    console.log(auth);

    if (!auth.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.userId = auth.userId;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const currentUser = await clerkClient.users.getUser(req.userId);
    const isAdmin =
      process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized - you must be an admin" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
