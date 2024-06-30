const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

// Create Blog
const createBlog = asyncHandler(async (req, res) => {
  const { name, sku, category, description } = req.body;

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Portfolio React",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create Blog
  const blog = await Blog.create({
    user: req.user.id,
    name,
    sku,
    category,
    description,
    image: fileData,
  });

  res.status(201).json(blog);
});

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    console.error('Error retrieving blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get single Blog
const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  // if Blog doesnt exist
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  res.status(200).json(blog);
});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  // if blog doesnt exist
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  // Match blog to its user
  if (blog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await blog.remove();
  res.status(200).json({ message: "Blog deleted." });
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;
  const { id } = req.params;

  const blog = await Blog.findById(id);

  // if blog doesnt exist
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  // Match blog to its user
  if (blog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Portfolio React",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      description,
      image: Object.keys(fileData).length === 0 ? blog?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedBlog);
});

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  deleteBlog,
  updateBlog,
};
