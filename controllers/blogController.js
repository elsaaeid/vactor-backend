const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;




// Create Blog
const createBlog = asyncHandler(async (req, res) => {
  const { name, sku, category, description, code } = req.body;

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
    code,
    image: fileData,
  });

  res.status(201).json(blog);
});

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('likedBy');
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
  const { name, category, description, code } = req.body;
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
      code,
      image: Object.keys(fileData).length === 0 ? blog?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedBlog);
});


// Like Blog
const likeBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const userId = req.user.id;
  try {
    const blog = await Blog.findById(blogId);
    if (blog) {
      if (!blog.likedBy.includes(userId)) {
        blog.likes++;
        blog.likedBy.push(userId);
        await blog.save();
        res.json({ message: 'Blog liked successfully' });
      } else {
        res.status(400).json({ message: 'You already liked this blog' });
      }
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// unLike blog
const unLikeBlog =  asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const userId = req.user.id;
  try {
    const blog = await Blog.findById(blogId);
    if (blog) {
      if (blog.likedBy.includes(userId)) {
        blog.likes--;
        const index = blog.likedBy.indexOf(userId);
        if (index !== -1) {
          blog.likedBy.splice(index, 1);
        }
        await blog.save();
        res.json({ message: 'Blog unliked successfully' });
      } else {
        res.status(400).json({ message: 'You did not like this blog' });
      }
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  deleteBlog,
  updateBlog,
  likeBlog,
  unLikeBlog,
};
