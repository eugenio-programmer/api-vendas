import AppError from "@shared/errors/AppError";
import { getCustomRepository } from "typeorm";
import { hash } from 'bcryptjs';
import {isAfter, addHours } from 'date-fns';
import UsersRepository from "../typeorm/repositories/UsersRepository";
import UserTokensRepository from "../typeorm/repositories/UserTokensRepository";

interface IRequest {
  token: string;
  password: string
}

class ResetPasswordService {
  public async execute({ token, password }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository)

    const userTokensRepository = getCustomRepository(UserTokensRepository)

    // Para pegar o usuário vai criar uma constante, chamando o usersRepository
    const userToken = await userTokensRepository.findByToken(token)

    if(!userToken) {
      throw new AppError('User Token does not exists.')
    }

    const user = await usersRepository.findById(userToken.user_id)

    if(!user) {
      throw new AppError('User does not exists.')
    }

    // Criar Constante para saber se já passou as 2 horas desde a solicitação da troca de senha,
    // caso já tenha passado o usuário terá que fazer uma nova solicitação de troca de senha
    const tokenCreatedAt = userToken.created_at

    const compareDate = addHours(tokenCreatedAt, 2)

    if(isAfter(Date.now(), compareDate)) {
      throw new AppError('Token expired.')
    }

    user.password = await hash(password, 8)

    await usersRepository.save(user)

  }
}

export default ResetPasswordService
