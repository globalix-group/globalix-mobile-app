import { Property } from '../models';
import { AppError } from '../middleware/errorHandler';

export class PropertyService {
  static async getProperties(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Property.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }

  static async getPropertyById(id: string) {
    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }
    return property;
  }

  static async createProperty(userId: string, data: any) {
    return await Property.create({
      ...data,
      ownerId: userId,
    });
  }

  static async updateProperty(id: string, userId: string, data: any) {
    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    if (property.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this property');
    }

    await property.update(data);
    return property;
  }

  static async deleteProperty(id: string, userId: string) {
    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    if (property.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this property');
    }

    await property.destroy();
    return { message: 'Property deleted successfully' };
  }

  static async getPropertiesForMap(bounds?: any) {
    return await Property.findAll({
      where: {
        latitude: { [require('sequelize').Op.ne]: null },
        longitude: { [require('sequelize').Op.ne]: null },
      },
      attributes: ['id', 'title', 'latitude', 'longitude', 'price', 'images'],
    });
  }

  static async searchProperties(query: string, type?: string, minPrice?: number, maxPrice?: number) {
    const where: any = {};

    if (query) {
      where[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { location: { [require('sequelize').Op.iLike]: `%${query}%` } },
      ];
    }

    if (type) where.type = type;
    if (minPrice) where.price = { [require('sequelize').Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [require('sequelize').Op.lte]: maxPrice };

    return await Property.findAll({ where });
  }

  static async getPropertyCategories() {
    return ['Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos'];
  }
}
