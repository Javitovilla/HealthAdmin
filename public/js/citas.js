// ========================================
// GESTIÓN DE CITAS - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // BÚSQUEDA DE PACIENTES
    // ========================================
    const inputBusqueda = document.getElementById('busquedaPaciente');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    const pacienteIdInput = document.getElementById('pacienteId');
    const pacienteSeleccionadoDiv = document.getElementById('pacienteSeleccionado');
    
    let timeoutBusqueda = null;

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function() {
            const busqueda = this.value.trim();
            clearTimeout(timeoutBusqueda);
            
            if (busqueda.length < 2) {
                resultadosDiv.innerHTML = '';
                resultadosDiv.style.display = 'none';
                return;
            }
            
            timeoutBusqueda = setTimeout(() => {
                buscarPacientes(busqueda);
            }, 500);
        });
    }

    async function buscarPacientes(busqueda) {
        try {
            const respuesta = await fetch(`/citas/api/buscar-pacientes?busqueda=${encodeURIComponent(busqueda)}`);
            const datos = await respuesta.json();
            mostrarResultados(datos.pacientes);
        } catch (error) {
            console.error('Error al buscar pacientes:', error);
            resultadosDiv.innerHTML = '<div style="padding: 10px; color: #e74c3c;">Error al buscar</div>';
            resultadosDiv.style.display = 'block';
        }
    }

    function mostrarResultados(pacientes) {
        if (!pacientes || pacientes.length === 0) {
            resultadosDiv.innerHTML = '<div style="padding: 10px; color: #666;">No se encontraron pacientes</div>';
            resultadosDiv.style.display = 'block';
            return;
        }
        
        let html = '<div style="max-height: 200px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">';
        pacientes.forEach(paciente => {
            html += `
                <div style="padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;" 
                     onmouseover="this.style.background='#f0f0f0'" 
                     onmouseout="this.style.background='white'"
                     onclick="seleccionarPaciente('${paciente._id}', '${paciente.nombre} ${paciente.apellidos}', '${paciente.tipoDocumento}-${paciente.numeroDocumento}')">
                    <strong style="color: #333;">${paciente.nombre} ${paciente.apellidos}</strong><br>
                    <small style="color: #666;">${paciente.tipoDocumento}-${paciente.numeroDocumento} | ${paciente.edad} años</small>
                </div>
            `;
        });
        html += '</div>';
        
        resultadosDiv.innerHTML = html;
        resultadosDiv.style.display = 'block';
    }

    window.seleccionarPaciente = function(id, nombre, documento) {
        pacienteIdInput.value = id;
        pacienteSeleccionadoDiv.innerHTML = `
            <div style="padding: 12px; background: #e7f3ff; border-radius: 5px; margin-top: 10px; border: 1px solid #b3d9ff;">
                <strong style="color: #0066cc;">✓ Paciente seleccionado:</strong> ${nombre} (${documento})
                <button type="button" onclick="limpiarSeleccion()" style="float: right; background: #e74c3c; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">✕</button>
            </div>
        `;
        inputBusqueda.value = '';
        resultadosDiv.innerHTML = '';
        resultadosDiv.style.display = 'none';
    };

    window.limpiarSeleccion = function() {
        pacienteIdInput.value = '';
        pacienteSeleccionadoDiv.innerHTML = '';
    };

    // ========================================
    // FILTRADO DE MÉDICOS POR ESPECIALIDAD
    // ========================================
    const especialidadSelect = document.getElementById('especialidad');
    const medicoSelect = document.getElementById('medico');
    
    if (especialidadSelect && medicoSelect) {
        especialidadSelect.addEventListener('change', async function() {
            const especialidad = this.value;
            
            console.log('Especialidad seleccionada:', especialidad); // Debug
            
            // Limpiar select de médicos
            medicoSelect.innerHTML = '<option value="">Cargando médicos...</option>';
            medicoSelect.disabled = true;
            
            if (!especialidad) {
                medicoSelect.innerHTML = '<option value="">Primero seleccione una especialidad</option>';
                return;
            }
            
            try {
                // URL corregida para usar query parameters
                const response = await fetch(`/citas/api/medicos?especialidad=${encodeURIComponent(especialidad)}`);
                const data = await response.json();
                
                console.log('Respuesta del servidor:', data); // Debug
                
                const medicos = data.medicos || [];
                
                if (medicos.length === 0) {
                    medicoSelect.innerHTML = '<option value="">No hay médicos disponibles en esta especialidad</option>';
                } else {
                    let options = '<option value="">Seleccione un médico</option>';
                    medicos.forEach(medico => {
                        options += `<option value="${medico._id}">${medico.nombre} - ${medico.especialidad}</option>`;
                    });
                    medicoSelect.innerHTML = options;
                    medicoSelect.disabled = false;
                }
            } catch (error) {
                console.error('Error al cargar médicos:', error);
                medicoSelect.innerHTML = '<option value="">Error al cargar médicos</option>';
            }
        });
    }

    // ========================================
    // CERRAR RESULTADOS AL HACER CLIC FUERA
    // ========================================
    document.addEventListener('click', function(e) {
        if (inputBusqueda && e.target !== inputBusqueda && !resultadosDiv.contains(e.target)) {
            resultadosDiv.style.display = 'none';
        }
    });
});