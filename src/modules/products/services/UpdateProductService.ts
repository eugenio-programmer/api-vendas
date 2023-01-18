import AppError from "@shared/errors/AppError";
import { getCustomRepository } from "typeorm";
import Product from "../typeorm/entities/Product";
import { ProductsRepository } from "../typeorm/repositories/ProductsRepository";

interface IRequest {
  id: string;
  name: string;
  price: number;
  quantity: number
}

class UpdateProductService {
  public async execute({ id, name, price, quantity }: IRequest): Promise<Product> {
    const productsRepository = getCustomRepository(ProductsRepository)

    const product = await productsRepository.findOne(id)

    if(!product) {
      throw new AppError('Product Not Found')
    }

    const productExists = await productsRepository.findByName(name)

    if(productExists && name !== product.name) {
      throw new AppError('There is Already One Product With This Name')
    }

    product.name = name
    product.price = price
    product.quantity = quantity

    await productsRepository.save(product)

    return product
  }
}

export default UpdateProductService
