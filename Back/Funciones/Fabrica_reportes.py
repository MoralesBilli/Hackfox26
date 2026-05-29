from abc import ABC, abstractmethod

class Reporte:

    def __init__(self, url_imagen, id_reporte, descripcion_usuario, longitud, timestamp, latitud, tipo,estado,severidad):

        self.id_reporte = id_reporte
        self.descripcion_usuario = descripcion_usuario
        self.estado = estado
        self.timestamp = timestamp
        self.latitud = latitud,
        self.longitud = longitud
        self.tipo = tipo
        self.severidad = severidad
        self.url_imagen = url_imagen


class TarjetaBase(ABC):

    @abstractmethod
    def crear_tarjeta(self):
        pass


class Tarjetas(TarjetaBase):

    def __init__(self, reporte):
        self.reporte = reporte


    def crear_tarjeta(self):

        tipo = self.reporte.tipo

        if tipo == "accidente_vial":
            color = "rojo"
        elif tipo == "Problema_peatonal":
            color = "naranja"
        elif tipo == "infraestructura_dañada":
            color = "cafe"
        elif tipo == "emergencia_riesgo":
            color = "negro"
        elif tipo == "peligro_discapacidad":
            color = "morado"
        else:
            color = "gris"

        # Formatear la fecha de forma segura a ISO string si tiene el método isoformat
        fecha_str = self.reporte.timestamp
        if self.reporte.timestamp:
            try:
                fecha_str = self.reporte.timestamp.isoformat()
            except AttributeError:
                fecha_str = str(self.reporte.timestamp)

        return {
            'id': self.reporte.id_reporte,
            'estado': self.reporte.estado,
            'tipo': self.reporte.tipo,
            'color': color,
            'descripcion': self.reporte.descripcion_usuario,
            'imagen': self.reporte.url_imagen,
            'fecha': fecha_str,
            'latitud': self.reporte.latitud,
            'longitud': self.reporte.longitud,
            'categoria': getattr(self.reporte, 'categoria', 'Desconocido'),
            'subcategoria': getattr(self.reporte, 'subcategoria', 'Desconocido')
        }


class FactoryTarjetas:

    @staticmethod
    def crear_tarjeta(reporte):

        return Tarjetas(reporte)