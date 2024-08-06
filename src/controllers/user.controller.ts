import {
  Controller,
  Route,
  Post,
  Body,
  Get,
  Path,
  Delete,
  Put,
  Query,
} from "tsoa";
import { UserModel, User } from "../database/models/user.models";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoose from "mongoose";
import { NotFoundError, ValidationError } from "../utils/errors/customErrors";
import { StatusCodes, ReasonPhrases } from "../utils/constands/statusCodes";

@Route("api/v1/users")
export class UsersController extends Controller {
  constructor() {
    super();
  }

  @Get()
  async getAllUser(
    @Query() page: string = "1",
    @Query() limit: string = "10",
    @Query() sortBy?: "age" | "fullName",
    @Query() sortOrder?: "asc" | "desc",
    @Query() gender?: "male" | "female",
    @Query() minAge?: string,
    @Query() maxAge?: string
  ): Promise<any> {
    try {
      const options = {
        page: parseInt(page || "1"),
        limit: parseInt(limit || "10"),
        sortBy: sortBy || "fullName",
        sortOrder: sortOrder === "desc" ? -1 : 1,
        gender: gender,
        minAge: parseInt(minAge || "0"),
        maxAge: parseInt(maxAge || "120"),
      };

      const filter: any = {};
      if (options.gender) {
        filter.gender = options.gender;
      }
      if (options.minAge !== undefined || options.maxAge !== undefined) {
        filter.age = {};
        if (options.minAge !== undefined) {
          filter.age.$gte = options.minAge;
        }
        if (options.maxAge !== undefined) {
          filter.age.$lte = options.maxAge;
        }
      }

      const totalUser = await UserModel.countDocuments(filter);
      const totalPages = Math.ceil(totalUser / options.limit);
      const sortOptions: { [key: string]: 1 | -1 } = {
        [options.sortBy]: options.sortOrder as 1 | -1,
      };

      const users = await UserModel.find(filter)
        .sort(sortOptions)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

      return { users, totalUser, totalPages, page: options.page };
    } catch (error: any) {
      console.error("Unexpected Error:", error);
      throw new Error(
        `${ReasonPhrases.INTERNAL_SERVER_ERROR}: ${error.message}`
      );
    }
  }

  @Get("{id}")
  public async getUser(@Path() id: string): Promise<User | null> {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError("Invalid user ID format");
      }
      const user = await UserModel.findById(id).exec();
      if (!user) {
        throw new NotFoundError(ReasonPhrases.NOT_FOUND);
      }
      return user;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(
        `${ReasonPhrases.INTERNAL_SERVER_ERROR}: ${error.message}`
      );
    }
  }

  @Put("{id}")
  public async updateUser(
    @Path() id: string,
    @Body()
    requestBody: {
      fullName?: string;
      email?: string;
      password?: string;
      status?: string;
      age?: number;
      gender?: "male" | "female";
    }
  ): Promise<any> {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError("Invalid user ID format");
      }
      const user = await UserModel.findById(id);
      if (!user) {
        throw new NotFoundError(ReasonPhrases.NOT_FOUND);
      }

      if (requestBody.fullName) user.fullName = requestBody.fullName;
      if (requestBody.email) user.email = requestBody.email;
      if (requestBody.password) {
        const hashedPassword = await bcrypt.hash(requestBody.password, 10);
        user.password = hashedPassword;
      }
      if (requestBody.status) user.status = requestBody.status;
      if (requestBody.age !== undefined) user.age = requestBody.age;
      if (requestBody.gender) user.gender = requestBody.gender;

      const updatedUser = await user.save();
      return {
        status: StatusCodes.OK,
        message: "User updated successfully",
        data: updatedUser,
      };
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Delete("{id}")
  public async deleteUser(@Path() id: string): Promise<any> {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError("Invalid user ID format");
      }
      const user = await UserModel.findById(id);
      if (!user) {
        throw new NotFoundError(ReasonPhrases.NOT_FOUND);
      }

      await UserModel.findByIdAndDelete(id);
      return { status: StatusCodes.OK, message: "Delete successfully" };
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Post("register")
  public async createUser(
    @Body()
    requestBody: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      age: number;
      gender: "male" | "female";
    }
  ): Promise<any> {
    try {
      if (
        !validator.isStrongPassword(requestBody.password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      ) {
        throw new ValidationError(
          ReasonPhrases.BAD_REQUEST + ": Password is not strong enough"
        );
      }

      const hashedPassword = await bcrypt.hash(requestBody.password, 10);

      const newUser = new UserModel({
        fullName: requestBody.fullName,
        username: requestBody.username,
        email: requestBody.email,
        password: hashedPassword,
        age: requestBody.age,
        gender: requestBody.gender,
      });

      const savedUser = await newUser.save();
      this.setStatus(StatusCodes.CREATED); // Ensure correct status code is set
      return {
        status: StatusCodes.CREATED,
        message: "User registered successfully",
        data: savedUser,
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === 11000) {
        throw new ValidationError(
          ReasonPhrases.BAD_REQUEST + ": Duplicate key error"
        );
      }
      if (error instanceof ValidationError) {
        throw error;
      }
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
