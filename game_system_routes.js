import querystring from 'node:querystring';

import { GameSystem } from './game_system.js';

function GameSystemRoutes(gameSystemData = {}) {
  const {
    getRank,
    getEffect,
    getEffectResult,
    rollRaw,
    roll,
    rollWithIntensity,
    rollVsIntensity,
    rollWithEffect,
    rollForEffect,
  } = GameSystem(gameSystemData);

  function handleGetRanks(_, res) {
    const responseRanks = JSON.stringify(gameSystemData.Ranks);
    res.statusCode = 200;
    res.end(responseRanks);
  }

  function handleGetRank(_, res, params) {
    try {
      const rank = getRank(params.rank);
      const responseRank = JSON.stringify(rank);
      res.statusCode = 200;
      res.end(responseRank);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }
  function handleGetEffects(_, res) {
    const responseEffects = JSON.stringify(gameSystemData.Effects);
    res.statusCode = 200;
    res.end(responseEffects);
  }

  function handleGetEffect(_, res, params) {
    try {
      const effect = getEffect(params.effect);
      const responseEffect = JSON.stringify(effect);
      res.statusCode = 200;
      res.end(responseEffect);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleGetEffectResult(_, res, params) {
    try {
      const result = getEffectResult(params.effect, params.color);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRoll(req, res, params) {
    try {
      const query = req.url.search;
      const {
        cs = 0
      } = querystring.parse(query);
      const result = roll(params.rank, cs);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRollRaw(req, res, params) {
    try {
      const query = req.url.search;
      const {
        cs = 0
      } = querystring.parse(query);
      const result = rollRaw(params.rank, params.roll, cs);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRollWithIntensity(req, res, params) {
    try {
      const query = req.url.search;
      const {
        cs = 0,
        is = 0,
      } = querystring.parse(query);
      const result = rollWithIntensity(params.rank, params.roll, params.intensity, cs, is);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRollVsIntensity(req, res, params) {
    try {
      const query = req.url.search;
      const {
        cs = 0,
        is = 0,
      } = querystring.parse(query);
      const result = rollVsIntensity(params.rank, params.intensity, cs, is);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRollWithEffect(req, res, params) {
    try {
      const query = req.url.search;
      const {
        cs = 0,
      } = querystring.parse(query);
      const result = rollWithEffect(params.rank, params.roll, params.effect, cs);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  function handleRollForEffect(req, res, params) {
    //rollForEffect(baseRank, effect = null, columnShift = 0
    try {
      const query = req.url.search;
      const {
        cs = 0,
      } = querystring.parse(query);
      const result = rollForEffect(params.rank, params.intensity, cs);
      const responseResult = JSON.stringify(result);
      res.statusCode = 200;
      res.end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.statusCode = 422;
      res.end(responseError);
    }
  }

  const routes = {
    '/ranks': handleGetRanks,
    '/ranks/:rank': handleGetRank,
    '/ranks/:rank/roll': handleRoll,
    '/ranks/:rank/roll/:roll': handleRollRaw,
    'ranks/:rank/intensity/:intensity/roll': handleRollVsIntensity,
    '/ranks/:rank/intensity/:intensity/roll/:roll': handleRollWithIntensity,
    '/ranks/:rank/roll/:roll/effect/:effect': handleRollWithEffect,
    '/ranks/:ranks/effect/:effect': handleRollForEffect,
    '/effects': handleGetEffects,
    '/effects/:effect': handleGetEffect,
    '/effects/:effect/:color': handleGetEffectResult,
  };

  return routes;
}

export { GameSystemRoutes };