import { Car } from '../models';
import { Op } from 'sequelize';

export class CarService {
  static async getCars(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Car.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getCarById(id: string) {
    const car = await Car.findByPk(id, {
      include: ['owner', 'reservations'],
    });

    if (!car) {
      throw {
        statusCode: 404,
        code: 'CAR_NOT_FOUND',
        message: 'Car not found',
      };
    }

    return car;
  }

  static async createCar(data: any, ownerId: string) {
    return Car.create({
      ...data,
      ownerId,
    });
  }

  static async updateCar(id: string, data: any, userId: string) {
    const car = await Car.findByPk(id);

    if (!car) {
      throw {
        statusCode: 404,
        code: 'CAR_NOT_FOUND',
        message: 'Car not found',
      };
    }

    if (car.ownerId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only edit your own cars',
      };
    }

    return car.update(data);
  }

  static async deleteCar(id: string, userId: string) {
    const car = await Car.findByPk(id);

    if (!car) {
      throw {
        statusCode: 404,
        code: 'CAR_NOT_FOUND',
        message: 'Car not found',
      };
    }

    if (car.ownerId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only delete your own cars',
      };
    }

    await car.destroy();
    return { message: 'Car deleted' };
  }

  static async searchCars(query: string) {
    return Car.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { brand: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 20,
    });
  }

  static async getCarCategories() {
    const cars = await Car.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true,
    });

    return cars.map((c: any) => c.category).filter(Boolean);
  }
}
