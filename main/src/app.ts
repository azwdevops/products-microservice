import express, { Request, Response } from "express";
import cors from "cors";
import amqp from "amqplib/callback_api";
import axios from "axios";

import { DataSource } from "typeorm";
import config from "./ormconfig";
import { Product } from "./entity/product";

const AppDataSource = new DataSource(config);

AppDataSource.initialize().then((db) => {
  const productRepository = db.getMongoRepository(Product);
  amqp.connect(process.env.RABBIT_MQ_URL, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertQueue("product_created", { durable: false });
      channel.assertQueue("product_updated", { durable: false });
      channel.assertQueue("product_deleted", { durable: false });

      const app = express();

      app.use(cors());
      app.use(express.json());

      channel.consume(
        "product_created",
        async (message) => {
          const eventProduct: Product = JSON.parse(message.content.toString());
          const product = new Product();
          product.admin_id = parseInt(eventProduct.id);
          product.title = eventProduct.title;
          product.image = eventProduct.image;
          product.likes = eventProduct.likes;

          await productRepository.save(product);
          console.log("Product created");
        },
        { noAck: true }
      );

      channel.consume(
        "product_updated",
        async (message) => {
          const eventProduct: Product = JSON.parse(message.content.toString());
          const product = await productRepository.findOneBy({ admin_id: parseInt(eventProduct.id) });
          productRepository.merge(product, { title: eventProduct.title, image: eventProduct.image, likes: eventProduct.likes });
          await productRepository.save(product);
          console.log("product updated");
        },
        { noAck: true }
      );

      channel.consume("product_deleted", async (message) => {
        const admin_id = parseInt(message.content.toString());
        await productRepository.deleteOne({ admin_id });
        console.log("product deleted");
      });

      app.get("/api/products", async (req: Request, res: Response) => {
        const products = await productRepository.find();
        return res.send(products);
      });

      app.post("/api/products/:id/like", async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id);
        console.log(product);
        await axios.post(`http://localhost:5000/api/products/${product.admin_id}/like`, {});
        product.likes++;
        await productRepository.save(product);
        return res.send(product);
      });

      app.listen(5001, () => {
        console.log("Listening on port 5001");
      });
      process.on("beforeExit", () => {
        console.log("Closing connection");
        connection.close();
      });
    });
  });
});
