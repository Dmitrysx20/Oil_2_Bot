const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const logger = require('../utils/logger');

class OilService {
    constructor() {
        this.supabase = null;
        this.useMockData = false;
        
        if (config.supabase.url && config.supabase.key) {
            this.supabase = createClient(config.supabase.url, config.supabase.key);
            logger.info('OilService: Supabase client initialized');
        } else {
            this.useMockData = true;
            logger.warn('OilService: Supabase credentials not found, using mock data');
        }
    }

    // Mock данные для тестирования
    getMockOils() {
        return [
            {
                id: 'mock-1',
                oil_name: 'Мята перечная',
                description: 'Освежающее масло с ментоловым ароматом',
                keywords: 'мята, ментол, свежесть, бодрость',
                emotional_effect: 'Повышает концентрацию, снимает стресс',
                physical_effect: 'Снимает головную боль, улучшает пищеварение',
                applications: 'Ингаляции, массаж, аромалампа',
                safety_warning: 'Не использовать при беременности, избегать попадания в глаза',
                joke: 'Почему мята такая свежая? Потому что она всегда "мятная"!'
            },
            {
                id: 'mock-2',
                oil_name: 'Лаванда',
                description: 'Успокаивающее масло с цветочным ароматом',
                keywords: 'лаванда, спокойствие, сон, релаксация',
                emotional_effect: 'Успокаивает нервную систему, улучшает сон',
                physical_effect: 'Снимает мышечное напряжение, заживляет раны',
                applications: 'Аромалампа, ванна, массаж',
                safety_warning: 'Может вызывать сонливость, не использовать перед вождением',
                joke: 'Лаванда - единственное растение, которое может усыпить даже будильник!'
            },
            {
                id: 'mock-3',
                oil_name: 'Эвкалипт',
                description: 'Очищающее масло с камфорным ароматом',
                keywords: 'эвкалипт, очищение, дыхание, простуда',
                emotional_effect: 'Повышает ясность мышления, снимает усталость',
                physical_effect: 'Улучшает дыхание, снимает заложенность носа',
                applications: 'Ингаляции, растирания, аромалампа',
                safety_warning: 'Не использовать при астме, избегать попадания в глаза',
                joke: 'Эвкалипт так хорошо очищает, что даже бактерии просят отпуск!'
            }
        ];
    }

    // Поиск масел по ключевым словам
    async searchOils(searchQuery) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Searching oils with mock data for: ${searchQuery}`);
                const mockOils = this.getMockOils();
                const filteredOils = mockOils.filter(oil => 
                    oil.oil_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    oil.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    oil.emotional_effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    oil.physical_effect.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return {
                    success: true,
                    data: filteredOils.map(oil => ({ ...oil, relevance_score: 1.0 }))
                };
            }

            const { data, error } = await this.supabase
                .rpc('search_oils', {
                    search_query: searchQuery
                });

            if (error) {
                logger.error(`OilService: Error searching oils: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Found ${data.length} oils for query: ${searchQuery}`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in searchOils: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение случайного масла
    async getRandomOil() {
        try {
            if (this.useMockData) {
                logger.info('OilService: Getting random oil with mock data');
                const mockOils = this.getMockOils();
                const randomIndex = Math.floor(Math.random() * mockOils.length);
                return { success: true, data: mockOils[randomIndex] };
            }

            const { data, error } = await this.supabase
                .rpc('get_random_oil');

            if (error) {
                logger.error(`OilService: Error getting random oil: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info('OilService: Retrieved random oil successfully');
            return { success: true, data: data[0] };
        } catch (error) {
            logger.error(`OilService: Exception in getRandomOil: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение масел по эффекту
    async getOilsByEffect(effectType, effectQuery) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Getting oils by effect with mock data: ${effectType} - ${effectQuery}`);
                const mockOils = this.getMockOils();
                const filteredOils = mockOils.filter(oil => {
                    if (effectType === 'emotional') {
                        return oil.emotional_effect.toLowerCase().includes(effectQuery.toLowerCase());
                    } else if (effectType === 'physical') {
                        return oil.physical_effect.toLowerCase().includes(effectQuery.toLowerCase());
                    }
                    return false;
                });
                return {
                    success: true,
                    data: filteredOils.map(oil => ({ ...oil, relevance_score: 1.0 }))
                };
            }

            const { data, error } = await this.supabase
                .rpc('get_oils_by_effect', {
                    effect_type: effectType,
                    effect_query: effectQuery
                });

            if (error) {
                logger.error(`OilService: Error getting oils by effect: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Found ${data.length} oils for effect: ${effectType} - ${effectQuery}`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in getOilsByEffect: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение масла по ID
    async getOilById(oilId) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Getting oil by ID with mock data: ${oilId}`);
                const mockOils = this.getMockOils();
                const oil = mockOils.find(o => o.id === oilId);
                return { success: !!oil, data: oil };
            }

            const { data, error } = await this.supabase
                .from('oils')
                .select('*')
                .eq('id', oilId)
                .single();

            if (error) {
                logger.error(`OilService: Error getting oil by ID: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Retrieved oil by ID: ${oilId}`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in getOilById: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение масла по названию
    async getOilByName(oilName) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Getting oil by name with mock data: ${oilName}`);
                const mockOils = this.getMockOils();
                const oil = mockOils.find(o => 
                    o.oil_name.toLowerCase() === oilName.toLowerCase()
                );
                return { success: !!oil, data: oil };
            }

            const { data, error } = await this.supabase
                .from('oils')
                .select('*')
                .ilike('oil_name', oilName)
                .single();

            if (error) {
                logger.error(`OilService: Error getting oil by name: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Retrieved oil by name: ${oilName}`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in getOilByName: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Добавление нового масла
    async addOil(oilData) {
        try {
            if (this.useMockData) {
                logger.info('OilService: Adding oil with mock data (not persisted)');
                const mockOil = {
                    id: `mock-${Date.now()}`,
                    ...oilData
                };
                return { success: true, data: mockOil, message: 'Oil added (mock mode)' };
            }

            const { data, error } = await this.supabase
                .rpc('add_oil', {
                    oil_name_param: oilData.oil_name,
                    description_param: oilData.description,
                    keywords_param: oilData.keywords,
                    emotional_effect_param: oilData.emotional_effect,
                    physical_effect_param: oilData.physical_effect,
                    applications_param: oilData.applications,
                    safety_warning_param: oilData.safety_warning,
                    joke_param: oilData.joke
                });

            if (error) {
                logger.error(`OilService: Error adding oil: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Added new oil: ${oilData.oil_name}`);
            return { success: true, data, message: 'Oil added successfully' };
        } catch (error) {
            logger.error(`OilService: Exception in addOil: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение всех масел
    async getAllOils() {
        try {
            if (this.useMockData) {
                logger.info('OilService: Getting all oils with mock data');
                return { success: true, data: this.getMockOils() };
            }

            const { data, error } = await this.supabase
                .from('oils')
                .select('*')
                .order('oil_name');

            if (error) {
                logger.error(`OilService: Error getting all oils: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Retrieved ${data.length} oils`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in getAllOils: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Обновление масла
    async updateOil(oilId, updateData) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Updating oil with mock data (not persisted): ${oilId}`);
                return { success: true, message: 'Oil updated (mock mode)' };
            }

            const { data, error } = await this.supabase
                .from('oils')
                .update(updateData)
                .eq('id', oilId)
                .select()
                .single();

            if (error) {
                logger.error(`OilService: Error updating oil: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Updated oil: ${oilId}`);
            return { success: true, data };
        } catch (error) {
            logger.error(`OilService: Exception in updateOil: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Удаление масла
    async deleteOil(oilId) {
        try {
            if (this.useMockData) {
                logger.info(`OilService: Deleting oil with mock data (not persisted): ${oilId}`);
                return { success: true, message: 'Oil deleted (mock mode)' };
            }

            const { error } = await this.supabase
                .from('oils')
                .delete()
                .eq('id', oilId);

            if (error) {
                logger.error(`OilService: Error deleting oil: ${error.message}`);
                return { success: false, error: error.message };
            }

            logger.info(`OilService: Deleted oil: ${oilId}`);
            return { success: true, message: 'Oil deleted successfully' };
        } catch (error) {
            logger.error(`OilService: Exception in deleteOil: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Получение статистики масел
    async getOilsStats() {
        try {
            if (this.useMockData) {
                logger.info('OilService: Getting oils stats with mock data');
                const mockOils = this.getMockOils();
                return {
                    success: true,
                    data: {
                        total_oils: mockOils.length,
                        oils_with_jokes: mockOils.filter(o => o.joke).length,
                        oils_with_safety_warnings: mockOils.filter(o => o.safety_warning).length,
                        average_keywords_per_oil: mockOils.reduce((sum, oil) => 
                            sum + (oil.keywords ? oil.keywords.split(',').length : 0), 0) / mockOils.length
                    }
                };
            }

            const { data, error } = await this.supabase
                .from('oils')
                .select('*');

            if (error) {
                logger.error(`OilService: Error getting oils stats: ${error.message}`);
                return { success: false, error: error.message };
            }

            const stats = {
                total_oils: data.length,
                oils_with_jokes: data.filter(o => o.joke).length,
                oils_with_safety_warnings: data.filter(o => o.safety_warning).length,
                average_keywords_per_oil: data.reduce((sum, oil) => 
                    sum + (oil.keywords ? oil.keywords.split(',').length : 0), 0) / data.length
            };

            logger.info('OilService: Retrieved oils statistics');
            return { success: true, data: stats };
        } catch (error) {
            logger.error(`OilService: Exception in getOilsStats: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Форматирование информации о масле для отправки
    formatOilMessage(oil) {
        let message = `🌿 **${oil.oil_name}**\n\n`;
        
        if (oil.description) {
            message += `📝 **Описание:** ${oil.description}\n\n`;
        }
        
        if (oil.emotional_effect) {
            message += `💭 **Эмоциональный эффект:** ${oil.emotional_effect}\n\n`;
        }
        
        if (oil.physical_effect) {
            message += `💪 **Физический эффект:** ${oil.physical_effect}\n\n`;
        }
        
        if (oil.applications) {
            message += `💡 **Применение:** ${oil.applications}\n\n`;
        }
        
        if (oil.safety_warning) {
            message += `⚠️ **Безопасность:** ${oil.safety_warning}\n\n`;
        }
        
        if (oil.joke) {
            message += `😄 **Интересный факт:** ${oil.joke}\n\n`;
        }
        
        return message.trim();
    }

    // Форматирование краткой информации о масле
    formatOilPreview(oil) {
        return `🌿 **${oil.oil_name}** - ${oil.description || 'Описание отсутствует'}`;
    }
}

module.exports = OilService; 