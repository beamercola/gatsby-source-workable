"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _axiosRateLimit = require("axios-rate-limit");

var _axiosRateLimit2 = _interopRequireDefault(_axiosRateLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require("crypto");
const axios = require("axios");

exports.sourceNodes = (() => {
  var _ref = _asyncToGenerator(function* ({ actions: { createNode } }, { subdomain, apiKey, queryParams = { state: "published" }, fetchJobDetails }) {
    const axiosClient = axios.create({
      baseURL: `https://${subdomain}.workable.com/spi/v3/`,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const limited = (0, _axiosRateLimit2.default)(axiosClient, {
      maxRequests: 2,
      perMilliseconds: 10000
    });

    // Get list of all jobs

    var _ref2 = yield axiosClient.get("/jobs", { params: queryParams });

    const jobs = _ref2.data.jobs;


    console.log("[WORKABLE] Total Jobs:", jobs.length);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = jobs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const job = _step.value;

        // Fetch job details if needed
        const jobData = fetchJobDetails ? (yield limited.get(`/jobs/${job.shortcode}`)).data : job;

        console.log("[WORKABLE] Adding:", job.shortcode);

        const jsonString = JSON.stringify(jobData);
        const gatsbyNode = _extends({}, jobData, {
          children: [],
          parent: "__SOURCE__",
          internal: {
            type: "WorkableJob",
            content: jsonString,
            contentDigest: crypto.createHash("md5").update(jsonString).digest("hex")
          }
          // Insert data into gatsby
        });createNode(gatsbyNode);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();