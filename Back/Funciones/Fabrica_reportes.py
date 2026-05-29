from abc import ABC, abstractmethod

class Reporte:

    def __init__(self, id, descripcion, imagen, fecha, ubicacion, hora, tipo, seguridad):

        self.id = id
        self.descripcion = descripcion
        self.imagen = imagen
        self.fecha = fecha
        self.hora = hora
        self.ubicacion = ubicacion
        self.tipo = tipo
        self.seguridad = seguridad


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
            'descripcion': self.reporte.descripcion,
            'imagen': self.reporte.imagen,
            'fecha': self.reporte.fecha,
            'ubicacion': self.reporte.ubicacion
        }


class FactoryTarjetas:

    @staticmethod
    def crear_tarjeta(reporte):

        return Tarjetas(reporte)