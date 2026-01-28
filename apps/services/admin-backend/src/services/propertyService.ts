import { Property } from '../models';
import { Op } from 'sequelize';

export class PropertyService {
  static async getProperties(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (category) {
      where.type = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const { count, rows } = await Property.findAndCountAll({
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

  static async getPropertyById(id: string) {
    const property = await Property.findByPk(id, {
      include: ['owner', 'inquiries'],
    });

    if (!property) {
      throw {
        statusCode: 404,
        code: 'PROPERTY_NOT_FOUND',
        message: 'Property not found',
      };
    }

    return property;
  }

  static async createProperty(data: any, ownerId: string) {
    return Property.create({
      ...data,
      ownerId,
    });
  }

  static async updateProperty(id: string, data: any, userId: string) {
    const property = await Property.findByPk(id);

    if (!property) {
      throw {
        statusCode: 404,
        code: 'PROPERTY_NOT_FOUND',
        message: 'Property not found',
      };
    }

    if (property.ownerId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only edit your own properties',
      };
    }

    return property.update(data);
  }

  static async deleteProperty(id: string, userId: string) {
    const property = await Property.findByPk(id);

    if (!property) {
      throw {
        statusCode: 404,
        code: 'PROPERTY_NOT_FOUND',
        message: 'Property not found',
      };
    }

    if (property.ownerId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only delete your own properties',
      };
    }

    await property.destroy();
    return { message: 'Property deleted' };
  }

  static async getPropertiesForMap(bounds?: any) {
    // Get properties within bounding box
    const where: any = {};

    if (bounds) {
      where.latitude = { [Op.between]: [bounds.minLat, bounds.maxLat] };
      where.longitude = { [Op.between]: [bounds.minLng, bounds.maxLng] };
    }

    return Property.findAll({
      where,
      attributes: ['id', 'title', 'latitude', 'longitude', 'price', 'images'],
    });
  }

  static async searchProperties(query: string) {
    return Property.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { location: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 20,
    });
  }

  static async getPropertyCategories() {
    return ['Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos'];
  }
}
