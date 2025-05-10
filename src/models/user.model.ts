export interface User {
    userID: number;
    name: string;
    email: string;
    password: string; // Será armazenado como hash
    cpf: string;
    bairro: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UserModel {
    constructor(public data: User) {}

    // Método para omitir a senha ao retornar dados do usuário
    public toJSON(): Omit<User, 'password'> {
        const { password, ...userWithoutPassword } = this.data;
        return userWithoutPassword;
    }
}