import { SAAS_CHAT_UTM_URL } from "@/app/constant";
import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";
const isApp = !!getClientConfig()?.isApp;

const es: PartialLocaleType = {
  WIP: "En construcción...",
  Error: {
    Unauthorized: isApp
      ? `😆 La conversación encontró algunos problemas, no te preocupes:
    \\ 1️⃣ Si deseas comenzar sin configuración, [haz clic aquí para empezar a chatear inmediatamente 🚀](${SAAS_CHAT_UTM_URL})
    \\ 2️⃣ Si deseas usar tus propios recursos de OpenAI, haz clic [aquí](/#/settings) para modificar la configuración ⚙️`
      : `😆 La conversación encontró algunos problemas, no te preocupes:
    \ 1️⃣ Si deseas comenzar sin configuración, [haz clic aquí para empezar a chatear inmediatamente 🚀](${SAAS_CHAT_UTM_URL})
    \ 2️⃣ Si estás utilizando una versión de implementación privada, haz clic [aquí](/#/auth) para ingresar la clave de acceso 🔑
    \ 3️⃣ Si deseas usar tus propios recursos de OpenAI, haz clic [aquí](/#/settings) para modificar la configuración ⚙️
 `,
  },
  Auth: {
    Title: "Se requiere contraseña",
    Tips: "El administrador ha habilitado la verificación de contraseña. Introduce el código de acceso a continuación",
    SubTips: "O ingresa tu clave API de OpenAI o Google",
    Input: "Introduce el código de acceso aquí",
    Confirm: "Confirmar",
    Later: "Más tarde",
    Return: "Regresar",
    SaasTips:
      "La configuración es demasiado complicada, quiero usarlo de inmediato",
    TopTips:
      "🥳 Oferta de lanzamiento de NextChat AI, desbloquea OpenAI o1, GPT-4o, Claude-3.5 y los últimos grandes modelos",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} conversaciones`,
  },
  Chat: {
    SubTitle: (count: number) => `Total de ${count} conversaciones`,
    EditMessage: {
      Title: "Editar registro de mensajes",
      Topic: {
        Title: "Tema de la conversación",
        SubTitle: "Cambiar el tema de la conversación actual",
      },
    },
    Actions: {
      ChatList: "Ver lista de mensajes",
      CompressedHistory: "Ver historial de Prompts comprimidos",
      Export: "Exportar historial de chat",
      Copy: "Copiar",
      Stop: "Detener",
      Retry: "Reintentar",
      Pin: "Fijar",
      PinToastContent:
        "Se ha fijado 1 conversación a los prompts predeterminados",
      PinToastAction: "Ver",
      Delete: "Eliminar",
      Edit: "Editar",
      RefreshTitle: "Actualizar título",
      RefreshToast: "Se ha enviado la solicitud de actualización del título",
    },
    Commands: {
      new: "Nueva conversación",
      next: "Siguiente conversación",
      prev: "Conversación anterior",
      clear: "Limpiar contexto",
      del: "Eliminar conversación",
    },
    InputActions: {
      Stop: "Detener respuesta",
      ToBottom: "Ir al más reciente",
      Theme: {
        auto: "Tema automático",
        light: "Modo claro",
        dark: "Modo oscuro",
      },
      Prompt: "Comandos rápidos",

      Clear: "Limpiar chat",
      Settings: "Configuración de conversación",
      UploadImage: "Subir imagen",
    },
    Rename: "Renombrar conversación",
    Typing: "Escribiendo…",
    Input: (submitKey: string) => {
      let inputHints = `${submitKey} para enviar`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += "，Shift + Enter para nueva línea";
      }
      return (
        inputHints + "，/ para activar autocompletado，: para activar comandos"
      );
    },
    Send: "Enviar",
    Config: {
      Reset: "Borrar memoria",

    },
    IsContext: "Prompt predeterminado",
  },
  Export: {
    Title: "Compartir historial de chat",
    Copy: "Copiar todo",
    Download: "Descargar archivo",
    Share: "Compartir en ShareGPT",
    MessageFromYou: "Usuario",
    MessageFromChatGPT: "ChatGPT",
    Format: {
      Title: "Formato de exportación",
      SubTitle: "Puedes exportar como texto Markdown o imagen PNG",
    },
    IncludeContext: {
      Title: "Incluir contexto de máscara",
      SubTitle: "Mostrar contexto de máscara en los mensajes",
    },
    Steps: {
      Select: "Seleccionar",
      Preview: "Vista previa",
    },
    Image: {
      Toast: "Generando captura de pantalla",
      Modal: "Mantén presionado o haz clic derecho para guardar la imagen",
    },
  },
  Select: {
    Search: "Buscar mensajes",
    All: "Seleccionar todo",
    Latest: "Últimos mensajes",
    Clear: "Limpiar selección",
  },
  Memory: {
    Title: "Resumen histórico",
    EmptyContent:
      "El contenido de la conversación es demasiado corto para resumir",
    Send: "Comprimir automáticamente el historial de chat y enviarlo como contexto",
    Copy: "Copiar resumen",
    Reset: "[no usado]",
    ResetConfirm: "¿Confirmar para borrar el resumen histórico?",
  },
  Home: {
    NewChat: "Nueva conversación",
    DeleteChat: "¿Confirmar la eliminación de la conversación seleccionada?",
    DeleteToast: "Conversación eliminada",
    Revert: "Deshacer",
  },
  Settings: {
    Title: "Configuración",
    SubTitle: "Todas las opciones de configuración",

    Danger: {
      Reset: {
        Title: "Restablecer todas las configuraciones",
        SubTitle:
          "Restablecer todas las configuraciones a los valores predeterminados",
        Action: "Restablecer ahora",
        Confirm: "¿Confirmar el restablecimiento de todas las configuraciones?",
      },
      Clear: {
        Title: "Eliminar todos los datos",
        SubTitle: "Eliminar todos los chats y datos de configuración",
        Action: "Eliminar ahora",
        Confirm:
          "¿Confirmar la eliminación de todos los chats y datos de configuración?",
      },
    },
    Lang: {
      Name: "Language", // ATENCIÓN: si deseas agregar una nueva traducción, por favor no traduzcas este valor, déjalo como `Language`
      All: "Todos los idiomas",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Tamaño de fuente",
      SubTitle: "Tamaño de la fuente del contenido del chat",
    },
    FontFamily: {
      Title: "Fuente del Chat",
      SubTitle:
        "Fuente del contenido del chat, dejar vacío para aplicar la fuente predeterminada global",
      Placeholder: "Nombre de la Fuente",
    },
    InjectSystemPrompts: {
      Title: "Inyectar mensajes del sistema",
      SubTitle:
        "Forzar la adición de un mensaje del sistema simulado de ChatGPT al principio de cada lista de mensajes",
    },
    InputTemplate: {
      Title: "Preprocesamiento de entrada del usuario",
      SubTitle: "El último mensaje del usuario se rellenará en esta plantilla",
    },

    Update: {
      Version: (x: string) => `Versión actual: ${x}`,
      IsLatest: "Ya estás en la última versión",
      CheckUpdate: "Buscar actualizaciones",
      IsChecking: "Buscando actualizaciones...",
      FoundUpdate: (x: string) => `Nueva versión encontrada: ${x}`,
      GoToUpdate: "Ir a actualizar",
    },
    SendKey: "Tecla de enviar",
    Theme: "Tema",
    TightBorder: "Modo sin borde",
    SendPreviewBubble: {
      Title: "Vista previa del globo",
      SubTitle:
        "Previsualiza el contenido Markdown en un globo de vista previa",
    },
    AutoGenerateTitle: {
      Title: "Generar título automáticamente",
      SubTitle: "Generar un título adecuado basado en el contenido del chat",
    },
    Sync: {
      CloudState: "Datos en la nube",
      NotSyncYet: "Aún no se ha sincronizado",
      Success: "Sincronización exitosa",
      Fail: "Sincronización fallida",

      Config: {
        Modal: {
          Title: "Configurar sincronización en la nube",
          Check: "Verificar disponibilidad",
        },
        SyncType: {
          Title: "Tipo de sincronización",
          SubTitle: "Selecciona el servidor de sincronización preferido",
        },
        Proxy: {
          Title: "Habilitar proxy",
          SubTitle:
            "Debes habilitar el proxy para sincronizar en el navegador y evitar restricciones de CORS",
        },
        ProxyUrl: {
          Title: "Dirección del proxy",
          SubTitle: "Solo para el proxy CORS incluido en este proyecto",
        },

        WebDav: {
          Endpoint: "Dirección WebDAV",
          UserName: "Nombre de usuario",
          Password: "Contraseña",
        },

        UpStash: {
          Endpoint: "URL de REST de UpStash Redis",
          UserName: "Nombre de respaldo",
          Password: "Token de REST de UpStash Redis",
        },
      },

      LocalState: "Datos locales",
      Overview: (overview: any) => {
        return `${overview.chat} conversaciones, ${overview.message} mensajes, ${overview.prompt} prompts`;
      },
      ImportFailed: "Importación fallida",
    },

    Prompt: {
      Disable: {
        Title: "Deshabilitar autocompletado de prompts",
        SubTitle:
          "Escribe / al principio del campo de entrada para activar el autocompletado",
      },
      List: "Lista de prompts personalizados",
      ListCount: (builtin: number, custom: number) =>
        `Integrados ${builtin}, definidos por el usuario ${custom}`,
      Edit: "Editar",
      Modal: {
        Title: "Lista de prompts",
        Add: "Nuevo",
        Search: "Buscar prompts",
      },
      EditModal: {
        Title: "Editar prompt",
      },
    },
    HistoryCount: {
      Title: "Número de mensajes históricos adjuntos",
      SubTitle: "Número de mensajes históricos enviados con cada solicitud",
    },
    CompressThreshold: {
      Title: "Umbral de compresión de mensajes históricos",
      SubTitle:
        "Cuando los mensajes históricos no comprimidos superan este valor, se realizará la compresión",
    },

    Usage: {
      Title: "Consulta de saldo",
      SubTitle(used: any, total: any) {
        return `Saldo usado este mes: $${used}, total suscrito: $${total}`;
      },
      IsChecking: "Verificando…",
      Check: "Revisar de nuevo",
      NoAccess:
        "Introduce la clave API o la contraseña de acceso para ver el saldo",
    },

    Access: {
      SaasStart: {
        Title: "Use NextChat AI",
        Label: "(The most cost-effective solution)",
        SubTitle:
          "Officially maintained by NextChat, zero configuration ready to use, supports the latest large models like OpenAI o1, GPT-4o, and Claude-3.5",
        ChatNow: "Chat Now",
      },

      AccessCode: {
        Title: "Contraseña de acceso",
        SubTitle: "El administrador ha habilitado el acceso encriptado",
        Placeholder: "Introduce la contraseña de acceso",
      },
      CustomEndpoint: {
        Title: "Interfaz personalizada",
        SubTitle: "¿Usar servicios personalizados de Azure u OpenAI?",
      },
      Provider: {
        Title: "Proveedor de modelos",
        SubTitle: "Cambiar entre diferentes proveedores",
      },
      OpenAI: {
        ApiKey: {
          Title: "Clave API",
          SubTitle:
            "Usa una clave API de OpenAI personalizada para omitir la restricción de acceso por contraseña",
          Placeholder: "Clave API de OpenAI",
        },

        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle:
            "Debe incluir http(s):// además de la dirección predeterminada",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Clave de interfaz",
          SubTitle:
            "Usa una clave de Azure personalizada para omitir la restricción de acceso por contraseña",
          Placeholder: "Clave API de Azure",
        },

        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle: "Ejemplo:",
        },

        ApiVerion: {
          Title: "Versión de la interfaz (versión de api de azure)",
          SubTitle: "Selecciona una versión específica",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "Clave de interfaz",
          SubTitle:
            "Usa una clave de Anthropic personalizada para omitir la restricción de acceso por contraseña",
          Placeholder: "Clave API de Anthropic",
        },

        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle: "Ejemplo:",
        },

        ApiVerion: {
          Title: "Versión de la interfaz (versión de claude api)",
          SubTitle: "Selecciona una versión específica de la API",
        },
      },
      Google: {
        ApiKey: {
          Title: "Clave API",
          SubTitle: "Obtén tu clave API de Google AI",
          Placeholder: "Introduce tu clave API de Google AI Studio",
        },

        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle: "Ejemplo:",
        },

        ApiVersion: {
          Title: "Versión de la API (solo para gemini-pro)",
          SubTitle: "Selecciona una versión específica de la API",
        },
        GoogleSafetySettings: {
          Title: "Nivel de filtrado de seguridad de Google",
          SubTitle: "Configura el nivel de filtrado de contenido",
        },
      },
      Baidu: {
        ApiKey: {
          Title: "Clave API",
          SubTitle: "Usa una clave API de Baidu personalizada",
          Placeholder: "Clave API de Baidu",
        },
        SecretKey: {
          Title: "Clave secreta",
          SubTitle: "Usa una clave secreta de Baidu personalizada",
          Placeholder: "Clave secreta de Baidu",
        },
        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle:
            "No admite personalización, dirígete a .env para configurarlo",
        },
      },
      ByteDance: {
        ApiKey: {
          Title: "Clave de interfaz",
          SubTitle: "Usa una clave API de ByteDance personalizada",
          Placeholder: "Clave API de ByteDance",
        },
        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle: "Ejemplo:",
        },
      },
      Alibaba: {
        ApiKey: {
          Title: "Clave de interfaz",
          SubTitle: "Usa una clave API de Alibaba Cloud personalizada",
          Placeholder: "Clave API de Alibaba Cloud",
        },
        Endpoint: {
          Title: "Dirección del endpoint",
          SubTitle: "Ejemplo:",
        },
      },
      CustomModel: {
        Title: "Nombre del modelo personalizado",
        SubTitle:
          "Agrega opciones de modelos personalizados, separados por comas",
      },
    },

    Model: "Modelo (model)",
    CompressModel: {
      Title: "Modelo de compresión",
      SubTitle: "Modelo utilizado para comprimir el historial",
    },
    Temperature: {
      Title: "Aleatoriedad (temperature)",
      SubTitle: "Cuanto mayor sea el valor, más aleatorio será el resultado",
    },
    TopP: {
      Title: "Muestreo por núcleo (top_p)",
      SubTitle: "Similar a la aleatoriedad, pero no cambies ambos a la vez",
    },
    MaxTokens: {
      Title: "Límite de tokens por respuesta (max_tokens)",
      SubTitle: "Número máximo de tokens utilizados en una sola interacción",
    },
    FrequencyPenalty: {
      Title: "Penalización de frecuencia (frequency_penalty)",
      SubTitle:
        "Cuanto mayor sea el valor, más probable es que se reduzcan las palabras repetidas",
    },
  },
  Store: {
    DefaultTopic: "Nuevo chat",
    BotHello: "¿En qué puedo ayudarte?",
    Error: "Hubo un error, inténtalo de nuevo más tarde",
    Prompt: {
      History: (content: string) =>
        "Este es un resumen del chat histórico como referencia: " + content,
      Topic:
        "Devuelve un tema breve de esta frase en cuatro a cinco palabras, sin explicación, sin puntuación, sin muletillas, sin texto adicional, sin negritas. Si no hay tema, devuelve 'charlas casuales'",
      Summarize:
        "Resume brevemente el contenido de la conversación para usar como un prompt de contexto, manteniéndolo dentro de 200 palabras",
    },
  },
  Copy: {
    Success: "Copiado al portapapeles",
    Failed: "Error al copiar, por favor otorga permisos al portapapeles",
  },
  Download: {
    Success: "Contenido descargado en tu directorio.",
    Failed: "Error al descargar.",
  },
  Context: {
    Toast: (x: any) => `Contiene ${x} prompts predefinidos`,
    Edit: "Configuración del chat actual",
    Add: "Agregar una conversación",
    Clear: "Contexto borrado",
    Revert: "Restaurar contexto",
  },
  Plugin: {
    Name: "Complemento",
  },
  FineTuned: {
    Sysmessage: "Eres un asistente",
  },
  SearchChat: {
    Name: "Buscar",
    Page: {
      Title: "Buscar en el historial de chat",
      Search: "Ingrese la palabra clave de búsqueda",
      NoResult: "No se encontraron resultados",
      NoData: "Sin datos",
      Loading: "Cargando",

      SubTitle: (count: number) => `Se encontraron ${count} resultados`,
    },
    Item: {
      View: "Ver",
    },
  },

  URLCommand: {
    Code: "Detectado un código de acceso en el enlace, ¿deseas autocompletarlo?",
    Settings:
      "Detectada configuración predefinida en el enlace, ¿deseas autocompletarla?",
  },

  UI: {
    Confirm: "Confirmar",
    Cancel: "Cancelar",
    Close: "Cerrar",
    Create: "Crear",
    Edit: "Editar",
    Export: "Exportar",
    Import: "Importar",
    Sync: "Sincronizar",
    Config: "Configurar",
  },
  Exporter: {
    Description: {
      Title: "Solo se mostrarán los mensajes después de borrar el contexto",
    },
    Model: "Modelo",
    Messages: "Mensajes",
    Topic: "Tema",
    Time: "Hora",
  },
};

export default es;
