import pool from "../db";

type LinkStatus = 'pending' | 'accepted' | 'revoked';

interface AdvisorClientLink {
  id: number;
  advisorId: number;
  clientId: number;
  status: LinkStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface AdvisorClientLinkRow {
  id: number;
  advisor_id: number;
  client_id: number;
  status: LinkStatus;
  created_at: Date;
  updated_at: Date;
}

function mapLinkRow(row: AdvisorClientLinkRow): AdvisorClientLink {
  return {
    id: row.id,
    advisorId: row.advisor_id,
    clientId: row.client_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


export async function createLinkRequest(advisorId: number, clientId: number): Promise<AdvisorClientLink>  {

  try {
    const result = await pool.query(`INSERT INTO advisor_client_links (advisor_id, client_id, status)
      VALUES ($1, $2, 'pending') RETURNING *`,
      [advisorId, clientId]
    )

    return mapLinkRow(result.rows[0]);

  } catch (err) {
    console.error(err);
    throw err;
  }
  
}

export async function getLinkStatus(advisorId: number, clientId: number): Promise<LinkStatus | null>   {
  
    try {
      const result = await pool.query(`SELECT status FROM advisor_client_links 
        WHERE advisor_id = $1 AND client_id = $2`,
        [advisorId, clientId])
        
      return mapLinkRow(result.rows[0])?.status ?? null;
      
    } catch (err) {
      console.error(err);
      throw err;
    }
}

export async function getLinkById(linkId: number): Promise<AdvisorClientLink | null> {
  
  try {
    const result = await pool.query("SELECT * FROM advisor_client_links WHERE id = $1", [linkId])

    const row = result.rows[0];
    return row ? mapLinkRow(row) : null;

  } catch (err) {
    console.error(err)
    throw err;
  }

}

export async function getIncomingRequests(clientId: number): Promise<AdvisorClientLink[]> {

  try {
    const result = await pool.query(`SELECT * FROM advisor_client_links
      WHERE client_id = $1 AND status = 'pending'`,
      [clientId])

    return result.rows.map(mapLinkRow);

  } catch (err) {
    console.error(err);
    throw err;
  }

}

export async function getOutgoingRequests(advisorId: number): Promise<AdvisorClientLink[]> {
    
  try {
      const result = await pool.query(`SELECT * FROM advisor_client_links
        WHERE advisor_id = $1 AND status = 'pending'`,
        [advisorId])

      return result.rows.map(mapLinkRow);

  } catch (err) {
    console.error(err);
    throw err;
  }

}

export async function getMyClients(advisorId: number): Promise<AdvisorClientLink[]> {

    try {
      const result = await pool.query(`SELECT * FROM advisor_client_links
        WHERE advisor_id = $1 AND status = 'accepted'`,
        [advisorId])

      return result.rows.map(mapLinkRow);

    } catch (err) {
      console.error(err);
      throw err;
    }
}

export async function getMyAdvisors(clientId: number): Promise<AdvisorClientLink[]> {
    
  try {
    const result = await pool.query(`SELECT * FROM advisor_client_links
      WHERE client_id = $1 AND status = 'accepted'`,
      [clientId])

    return result.rows.map(mapLinkRow);

  } catch (err) {
    console.error(err);
    throw err;
  }

}

export async function updateLinkStatus(linkId: number, newStatus: LinkStatus): Promise<AdvisorClientLink> {
   
  try { 
    const result = await pool.query(`UPDATE advisor_client_links
      SET status = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *`, [
        newStatus, linkId
      ])

    return mapLinkRow(result.rows[0]);

  } catch (err) {
    console.error(err);
    throw err;
  }

}
