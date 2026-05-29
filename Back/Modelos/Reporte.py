class Reporte:

    def __init__(
        self,
        id_reporte,
        descripcion_usuario,
        estado,
        timestamp,
        latitud,
        longitud,
        tipo,
        severidad,
        url_imagen
    ):

        self.id_reporte = id_reporte
        self.descripcion_usuario = descripcion_usuario
        self.timestamp = timestamp
        self.latitud = latitud
        self.longitud = longitud
        self.estado = estado
        self.tipo = tipo
        self.severidad = severidad
        self.url_imagen = url_imagen

    # Convertir objeto a diccionario
    def to_dict(self):

        return {
            'id_reporte': self.id_reporte,
            'descripcion_usuario': self.descripcion_usuario,
            'timestamp': self.timestamp,
            'latitud': self.latitud,
            'longitud': self.longitud,
            'estado': self.estado,
            'tipo': self.tipo,
            'severidad':self.severidad,
            'url_imagen':self.url_imagen
        }