import querystring from 'node:querystring';

import { GameSystem } from './game_system';

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
    res.status(200).end(responseRanks);
  }

  function handleGetRank(_, res, params) {
    try {
      const rank = getRank(params.rank);
      const responseRank = JSON.stringify(rank);
      res.status(200).end(responseRank);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.status(422).end(responseError);
    }
  }
  function handleGetEffects(_, res) {
    const responseEffects = JSON.stringify(gameSystemData.Effects);
    res.status(200).end(responseEffects);
  }

  function handleGetEffect(_, res, params) {
    try {
      const effect = getEffect(params.effect);
      const responseEffect = JSON.stringify(effect);
      res.status(200).end(responseEffect);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.status(422).end(responseError);
    }
  }

  function handleGetEffectResult(_, res, params) {
    try {
      const result = getEffectResult(params.effect, params.color);
      const responseResult = JSON.stringify(result);
      res.status(200).end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.status(422).end(responseError);
    }
  }

  function handleRoll(_, res, params) {
    try {
      const query = res.url.search;
      const { cs = 0 } = querystring.parse(query);
      const result = roll(params.rank, cs);
      const responseResult = JSON.stringify(result);
      res.status(200).end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.status(422).end(responseError);
    }
  }

  function handleRollRaw(_, res, params) {
    try {
      const query = res.url.search;
      const { cs = 0 } = querystring.parse(query);
      const result = rollRaw(params.rank, params.roll, cs)
      const responseResult = JSON.stringify(result);
      res.status(200).end(responseResult);
    } catch (error) {
      const responseError = JSON.stringify(error);
      res.status(422).end(responseError);
    }
  }


  const routes = {
    '/ranks': handleGetRanks,
    '/ranks/:rank': handleGetRank,
    '/ranks/:rank/roll': handleRoll,
    '/ranks/:rank/roll/:roll': handleRollRaw,
    '/effects': handleGetEffects,
    '/effects/:effect': handleGetEffect,
    '/effects/:effect/:color': handleGetEffectResult,
  };

  return routes;
}

export default { GameSystemRoutes };