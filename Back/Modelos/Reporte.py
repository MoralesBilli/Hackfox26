class Reporte:

    def __init__(
        self,
        id,
        descripcion,
        imagen,
        fecha,
        ubicacion,
        estado='normal'
    ):

        self.id = id
        self.descripcion = descripcion
        self.imagen = imagen
        self.fecha = fecha
        self.ubicacion = ubicacion
        self.estado = estado

    # Convertir objeto a diccionario
    def to_dict(self):

        return {
            'id': self.id,
            'descripcion': self.descripcion,
            'imagen': self.imagen,
            'fecha': self.fecha,
            'ubicacion': self.ubicacion,
            'estado': self.estado
        }