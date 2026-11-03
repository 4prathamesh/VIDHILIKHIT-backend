// Assumption: LocationController handles /locations/autocomplete endpoint.
const locationService = require('../services/location.service');
const { success } = require('../utils/response');

class LocationController {
  autocomplete(req, res) {
    const { query } = req.query;
    const result = locationService.search(query);
    return success(res, result, 'Location autocomplete predictions fetched', 200);
  }
}

module.exports = new LocationController();

