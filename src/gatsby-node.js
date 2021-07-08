import rateLimit from "axios-rate-limit"
const crypto = require("crypto")
const axios = require("axios")

exports.sourceNodes = async (
  { actions: { createNode } },
  { subdomain, apiKey, queryParams = { state: "published" }, fetchJobDetails }
) => {
  const axiosClient = axios.create({
    baseURL: `https://${subdomain}.workable.com/spi/v3/`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const limited = rateLimit(axiosClient, {
    maxRequests: 2,
    perMilliseconds: 10000,
  })

  // Get list of all jobs
  const {
    data: { jobs },
  } = await axiosClient.get("/jobs", { params: queryParams })

  console.log("[WORKABLE] Total Jobs:", jobs.length)

  for (const job of jobs) {
    // Fetch job details if needed
    const jobData = fetchJobDetails
      ? (await limited.get(`/jobs/${job.shortcode}`)).data
      : job

    console.log("[WORKABLE] Adding:", job.shortcode)

    const jsonString = JSON.stringify(jobData)
    const gatsbyNode = {
      ...jobData,
      children: [],
      parent: "__SOURCE__",
      internal: {
        type: "WorkableJob",
        content: jsonString,
        contentDigest: crypto
          .createHash("md5")
          .update(jsonString)
          .digest("hex"),
      },
    }
    // Insert data into gatsby
    createNode(gatsbyNode)
  }
}
