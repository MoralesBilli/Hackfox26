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

        if tipo == "accidente":
            color = "rojo"
        else:
            color = "gris"

        return {
            'tipo': self.reporte.tipo,
            'color': color,
            'descripcion': self.reporte.descripcion_usuario,
            'imagen': self.reporte.url_imagen,
            'fecha': self.reporte.timestamp,
            'latitud': self.reporte.latitud,
            'longitud':self.reporte.longitud
        }


class FactoryTarjetas:

    @staticmethod
    def crear_tarjeta(reporte):

        return Tarjetas(reporte)