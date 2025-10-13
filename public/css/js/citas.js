// public/js/citas.js

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const inputBusqueda = document.getElementById('buscarPaciente');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    const pacienteIdInput = document.getElementById('pacienteId');
    const pacienteSeleccionadoDiv = document.getElementById('pacienteSeleccionado');
    
    let timeoutBusqueda = null;

    // Evento de escritura en el input
    inputBusqueda.addEventListener('input', function() {
        const busqueda = this.value.trim();
        
        // Limpiar timeout anterior
        clearTimeout(timeoutBusqueda);
        
        // Si no hay texto, limpiar resultados
        if (busqueda.length < 2) {
            resultadosDiv.innerHTML = '';
            resultadosDiv.style.display = 'none';
            return;
        }
        
        // Esperar 500ms antes de buscar (debounce)
        timeoutBusqueda = setTimeout(() => {
            buscarPacientes(busqueda);
        }, 500);
    });

    // Función para buscar pacientes
    async function buscarPacientes(busqueda) {
        try {
            const respuesta = await fetch(`/citas/buscar-paciente?busqueda=${encodeURIComponent(busqueda)}`);
            const datos = await respuesta.json();
            
            mostrarResultados(datos.pacientes);
        } catch (error) {
            console.error('Error al buscar pacientes:', error);
            resultadosDiv.innerHTML = '<div class="search-error">Error al buscar pacientes</div>';
            resultadosDiv.style.display = 'block';
        }
    }

    // Función para mostrar resultados
    function mostrarResultados(pacientes) {
        if (pacientes.length === 0) {
            resultadosDiv.innerHTML = '<div class="search-no-results">No se encontraron pacientes</div>';
            resultadosDiv.style.display = 'block';
            return;
        }
        
        let html = '<ul class="search-list">';
        
        pacientes.forEach(paciente => {
            html += `
                <li class="search-item" data-id="${paciente._id}" data-nombre="${paciente.nombre} ${paciente.apellidos}" data-documento="${paciente.tipoDocumento}-${paciente.numeroDocumento}">
                    <strong>${paciente.nombre} ${paciente.apellidos}</strong>
                    <br>
                    <small>${paciente.tipoDocumento}-${paciente.numeroDocumento} | Edad: ${paciente.edad} años</small>
                </li>
            `;
        });
        
        html += '</ul>';
        
        resultadosDiv.innerHTML = html;
        resultadosDiv.style.display = 'block';
        
        // Agregar eventos de clic a los resultados
        const items = resultadosDiv.querySelectorAll('.search-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                seleccionarPaciente(
                    this.dataset.id,
                    this.dataset.nombre,
                    this.dataset.documento
                );
            });
        });
    }

    // Función para seleccionar un paciente
    function seleccionarPaciente(id, nombre, documento) {
        // Guardar ID en input oculto
        pacienteIdInput.value = id;
        
        // Mostrar paciente seleccionado
        pacienteSeleccionadoDiv.innerHTML = `
            <div class="paciente-badge">
                <strong>Paciente seleccionado:</strong> ${nombre} (${documento})
                <button type="button" class="btn-remove" onclick="limpiarSeleccion()">✕</button>
            </div>
        `;
        
        // Limpiar y ocultar resultados
        inputBusqueda.value = '';
        resultadosDiv.innerHTML = '';
        resultadosDiv.style.display = 'none';
    }

    // Función global para limpiar selección
    window.limpiarSeleccion = function() {
        pacienteIdInput.value = '';
        pacienteSeleccionadoDiv.innerHTML = '';
    };

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target !== inputBusqueda && !resultadosDiv.contains(e.target)) {
            resultadosDiv.style.display = 'none';
        }
    });
});
