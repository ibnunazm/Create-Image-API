import Product from "../models/ProductModel.js";
import path from "path";
import fs from "fs";

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const getProductsById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(product);
  } catch (error) {
    console.log(error);
  }
};

const createProduct = async (req, res) => {
  if (req.files === null)
    return res.status(400).json({ msg: "No file uploaded" });
  const name = req.body.title;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (allowedType.includes(ext.toLowerCase()) === false) {
    return res.status(400).json({ msg: "File type not allowed" });
  }

  if (fileSize > 5000000) {
    return res.status(400).json({ msg: "File size must be less than 5MB" });
  }

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      const product = await Product.create({
        name,
        image: fileName,
        url,
      });
      res.status(201).json({ msg: "Product created successfully" });
      res.json(product);
    } catch (error) {
      console.log(error);
    }
  });
};

const updateProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!product) return res.status(404).json({ msg: "Product not found" });
  let fileName = "";
  if (req.files === null) {
    fileName = product.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (allowedType.includes(ext.toLowerCase()) === false) {
      return res.status(400).json({ msg: "File type not allowed" });
    }
    if (fileSize > 5000000) {
      return res.status(400).json({ msg: "File size must be less than 5MB" });
    }

    const filePath = `./public/images/${product.image}`;
    fs.unlinkSync(filePath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }
  const name = req.body.title;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  try {
    await Product.update(
      {
        name,
        image: fileName,
        url,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({ msg: "Product updated successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!product) return res.status(404).json({ msg: "Product not found" });
  try {
    const filePath = `./public/images/${product.image}`;
    fs.unlinkSync(filePath);
    await product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

export {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct,
};
