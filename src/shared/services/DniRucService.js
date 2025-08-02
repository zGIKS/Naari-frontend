// DniRucService.js
// Servicio para buscar datos por DNI y RUC usando los endpoints del backend

import { API_CONFIG } from '../config/ApiConfig.js';

export async function searchByDni(dni) {
  if (!dni || dni.length !== 8) return null;
  
  try {
    const token = sessionStorage.getItem('naari_token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    // Usar el endpoint real de la API para buscar DNI
    const response = await fetch(`${API_CONFIG.API_BASE}/clients/search/${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('DNI not found in RENIEC');
        return { found: false, message: 'DNI no encontrado en RENIEC' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transformar la respuesta de la API al formato esperado por el formulario
    if (data.found) {
      return {
        found: true,
        dni: data.dni,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.full_name,
        message: data.message
      };
    } else {
      return { found: false, message: data.message || 'DNI no encontrado' };
    }
    
  } catch (err) {
    console.error('Error searching DNI:', err);
    return { found: false, message: 'Error al buscar DNI' };
  }
}

export async function searchByRuc(ruc) {
  if (!ruc || ruc.length !== 11) return null;
  
  try {
    const token = sessionStorage.getItem('naari_token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    // Usar el endpoint real de la API para buscar RUC
    const response = await fetch(`${API_CONFIG.API_BASE}/sunat/ruc?numero=${ruc}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('RUC not found in SUNAT');
        return { found: false, message: 'RUC no encontrado en SUNAT' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transformar la respuesta de SUNAT al formato esperado por el formulario
    if (data.company_name) {
      return {
        found: true,
        ruc: data.document_number,
        company_name: data.company_name,
        address: data.address,
        district: data.district,
        province: data.province,
        department: data.department,
        status: data.status,
        condition: data.condition
      };
    } else {
      return { found: false, message: 'RUC no encontrado' };
    }
    
  } catch (err) {
    console.error('Error searching RUC:', err);
    return { found: false, message: 'Error al buscar RUC' };
  }
}
