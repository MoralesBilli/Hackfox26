from Rutas.Reportes.Crear_reporte import Crear_reporte_bp
from Rutas.Usuarios.Creacion_usuarios import Usuarios_bp
from Rutas.Usuarios.Iniciar_sesion import Iniciar_sesion_bp
from Rutas.Reportes.Obtener_reporte import Obtener_reporte_bp


from Rutas.Maps.buscar_lugar import buscar_lugar_bp
blueprints = [Crear_reporte_bp, Usuarios_bp, Iniciar_sesion_bp,Obtener_reporte_bp,buscar_lugar_bp]