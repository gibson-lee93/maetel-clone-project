import { EntityRepository, Repository } from "typeorm";
import { auth_user } from "./user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@EntityRepository(auth_user)
export class UserRepository extends Repository<auth_user> {
	async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
		const { email, password } = authCredentialsDto;

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = this.create({ email, password: hashedPassword });

		try {
			await this.save(user);
		} catch (error) {
			if(error.code === 'ER_DUP_ENTRY') { //duplicate email
				throw new ConflictException('Email already exists');
			} else {
				throw new InternalServerErrorException();
			}
		}
	}
}