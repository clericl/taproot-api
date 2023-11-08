const { BigQuery } = require('@google-cloud/bigquery')

class BQClient {
  client: typeof BigQuery

  static init() {
    return new BigQuery({ projectId: process.env.GOOGLE_PROJECT_ID })
  }

  constructor() {
    this.client = BQClient.init()
  }

  async runQuery(query: string) {
    const options = {
      query,
      location: 'US',
    }
    const [rows] = await this.client.query(options)
    
    return {
      meta: {
        count: rows.length,
      },
      data: rows,
    }
  }

  async getTree(id: number) {
    const sqlQuery = `
      SELECT *
      FROM \`${process.env.TREES_TABLE}\`
      WHERE OBJECTID = ${id}
      LIMIT ${1}
    `

  const data = await this.runQuery(sqlQuery)
  return data
  }
}

export default BQClient
