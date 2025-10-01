import sql from 'mssql';

const DB_CONFIG: sql.config = {
    server: 'regsale-db-server.database.windows.net',
    database: 'HealthWidgets',
    user: 'superuser123',
    password: '51mpl3Compliance$2',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    connectionTimeout: 30000
};

interface Component {
    id: number;
    componentName: string;
    componentDescription: string;
}

/**
 * Get all components from the database
 */
export async function getAllComponents(): Promise<Component[]> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(DB_CONFIG);
        const result = await pool.request().query('SELECT id, componentName, componentDescription FROM Components');
        return result.recordset as Component[];
    } catch (error: any) {
        console.error('Database error:', error.message);
        throw new Error(`Failed to fetch components: ${error.message}`);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

/**
 * Get a specific component by ID
 */
export async function getComponentById(id: number): Promise<Component | null> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(DB_CONFIG);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, componentName, componentDescription FROM Components WHERE id = @id');

        return result.recordset[0] as Component || null;
    } catch (error: any) {
        console.error('Database error:', error.message);
        throw new Error(`Failed to fetch component ${id}: ${error.message}`);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

/**
 * Search components by name (case-insensitive partial match)
 */
export async function searchComponentsByName(searchTerm: string): Promise<Component[]> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(DB_CONFIG);
        const result = await pool.request()
            .input('searchTerm', sql.VarChar, `%${searchTerm}%`)
            .query('SELECT id, componentName, componentDescription FROM Components WHERE componentName LIKE @searchTerm');

        return result.recordset as Component[];
    } catch (error: any) {
        console.error('Database error:', error.message);
        throw new Error(`Failed to search components: ${error.message}`);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}
