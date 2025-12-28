const { validateAnalysisInput } = require('../utils/validators');

/**
 * Validation middleware for analysis inputs
 */
const validateAnalysis = (req, res, next) => {
    const { error } = validateAnalysisInput(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    
    next();
};

/**
 * Validate query parameters
 */
const validateQueryParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: error.details
            });
        }
        
        next();
    };
};

module.exports = { validateAnalysis, validateQueryParams };