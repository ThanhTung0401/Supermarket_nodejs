import {UsersService} from './users.service.js';

export class UsersController {
    constructor() {
        this.usersService = new UsersService();
    }

    getAll = async (req, res, next) => {
        try {
            const users = await this.usersService.getAllUsers(req.query);
            res.status(200).json({
                status: 'success',
                data: {
                    users
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getOne = async (req, res, next) => {
        try {
            const user = await this.usersService.getUserById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: {
                    user
                }
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const user = await this.usersService.updateUser(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: {
                    user
                }
            });
        } catch (error) {
            next(error);
        }
    };

    toggleActive = async (req, res, next) => {
        try {
            const user = await this.usersService.toggleActive(req.params.id);
            res.status(200).json({
                status: 'success',
                message: user.isActive ? 'User activated' : 'User deactivated',
                data: {
                    user
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
