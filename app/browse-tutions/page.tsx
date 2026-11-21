import { getTutions } from "@/lib/api/tutions"
import React from "react"

const BrowseTutionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const search = await searchParams
  const urlSearch = new URLSearchParams(search as Record<string, string>)
  const query = urlSearch.toString()
  console.log("Search params", query)

  const tutions = await getTutions(query)
  return (
    <div>
      <h2>Browse Tution page</h2>
      <ul>
        {tutions.map((tution) => {
          ;<li key={tution._id}>{tution.title}</li>
        })}
      </ul>
    </div>
  )
}

export default BrowseTutionsPage
