import { Property } from '../models';
import { AppError } from '../middleware/errorHandler';

export class PropertyService {
  private static sanitizePropertyPayload(data: any) {
    const payload: Record<string, any> = {};

    if (typeof data?.title === 'string') payload.title = data.title.trim();
    if (typeof data?.description === 'string') payload.description = data.description.trim();
    if (typeof data?.location === 'string') payload.location = data.location.trim();
    if (typeof data?.latitude === 'number') payload.latitude = data.latitude;
    if (typeof data?.longitude === 'number') payload.longitude = data.longitude;
    if (typeof data?.price === 'number') payload.price = data.price;
    if (typeof data?.beds === 'number') payload.beds = data.beds;
    if (typeof data?.baths === 'number') payload.baths = data.baths;
    if (typeof data?.sqft === 'number') payload.sqft = data.sqft;
    if (Array.isArray(data?.images)) payload.images = data.images.filter((v: any) => typeof v === 'string');
    if (Array.isArray(data?.amenities)) payload.amenities = data.amenities.filter((v: any) => typeof v === 'string');
    if (typeof data?.type === 'string') payload.type = data.type;
    if (typeof data?.status === 'string') payload.status = data.status;

    return payload;
  }
  static async getProperties(tenantId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Property.findAndCountAll({
      where: { tenantId },
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

  static async getPropertyById(tenantId: string, id: string) {
    const property = await Property.findOne({ where: { id, tenantId } });
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }
    return property;
  }

  static async createProperty(tenantId: string, userId: string, data: any) {
    const payload = PropertyService.sanitizePropertyPayload(data);
    return await Property.create({
      ...payload,
      tenantId,
      ownerId: userId,
    });
  }

  static async updateProperty(tenantId: string, id: string, userId: string, data: any) {
    const property = await Property.findOne({ where: { id, tenantId } });
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    if (property.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this property');
    }

    const payload = PropertyService.sanitizePropertyPayload(data);
    await property.update(payload);
    return property;
  }

  static async deleteProperty(tenantId: string, id: string, userId: string) {
    const property = await Property.findOne({ where: { id, tenantId } });
    if (!property) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
    }

    if (property.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this property');
    }

    await property.destroy();
    return { message: 'Property deleted successfully' };
  }

  static async getPropertiesForMap(tenantId: string, bounds?: any) {
    void bounds;
    return await Property.findAll({
      where: {
        tenantId,
        latitude: { [require('sequelize').Op.ne]: null },
        longitude: { [require('sequelize').Op.ne]: null },
      },
      attributes: ['id', 'title', 'latitude', 'longitude', 'price', 'images'],
    });
  }

  static async searchProperties(tenantId: string, query: string, type?: string, minPrice?: number, maxPrice?: number) {
    const where: any = { tenantId };

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
