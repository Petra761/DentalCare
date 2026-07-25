# Reglas derivadas de los Requerimientos No Funcionales

Las siguientes reglas establecen las condiciones técnicas y de calidad que debe cumplir el sistema, tomando como referencia los requisitos no funcionales definidos.

| Tipo  | Nro | Regla derivada del RNF                 | Descripción                                                                                                                                 |
| ----- | --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-R | 1   | Disponibilidad del sistema             | El sistema debe mantenerse disponible como mínimo el 99.9 % del tiempo para garantizar la atención automatizada mediante WhatsApp.          |
| RNF-R | 2   | Tiempo de sincronización               | Los cambios realizados en la agenda deben sincronizarse entre el panel web y el asistente virtual en un tiempo máximo de 5 segundos.        |
| RNF-R | 3   | Interfaz responsive                    | La plataforma web debe adaptarse correctamente a diferentes tamaños de pantalla y dispositivos.                                             |
| RNF-R | 4   | Compatibilidad con navegadores         | El sistema debe funcionar correctamente en los principales navegadores web utilizados por los usuarios.                                     |
| RNF-R | 5   | Validación de datos                    | El sistema debe validar el formato de los datos ingresados por los pacientes antes de procesarlos o almacenarlos.                           |
| RNF-R | 6   | Detección de interacciones inválidas   | El sistema debe identificar registros inválidos, mensajes maliciosos o interacciones sospechosas durante la comunicación mediante WhatsApp. |
| RNF-R | 7   | Protección de contraseñas              | Las contraseñas de los usuarios deben almacenarse utilizando un algoritmo de hash seguro y no deben guardarse en texto plano.               |
| RNF-R | 8   | Autenticación segura                   | El sistema debe validar las credenciales del usuario antes de permitir el acceso a cualquier funcionalidad protegida.                       |
| RNF-R | 9   | Autorización por roles                 | El sistema debe comprobar que el usuario autenticado tenga los permisos necesarios para ejecutar cada funcionalidad solicitada.             |
| RNF-R | 10  | Protección contra acceso no autorizado | Un usuario no debe poder acceder a funcionalidades o información que no correspondan a los permisos definidos para su rol.                  |
