/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, blue.chu
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of blue.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL blue.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * ***** END LICENSE BLOCK ***** */

export enum ClientFlags {
	// Connections Flags
	// Manually extracted from mysql-5.5.23/include/mysql_com.h
	CLIENT_LONG_PASSWORD     = 1, /* new more secure passwords */
	CLIENT_FOUND_ROWS        = 2, /* Found instead of affected rows */
	CLIENT_LONG_FLAG         = 4, /* Get all column flags */
	CLIENT_CONNECT_WITH_DB   = 8, /* One can specify db on connect */
	CLIENT_NO_SCHEMA         = 16, /* Don't allow database.table.column */
	CLIENT_COMPRESS          = 32, /* Can use compression protocol */
	CLIENT_ODBC              = 64, /* Odbc client */
	CLIENT_LOCAL_FILES       = 128, /* Can use LOAD DATA LOCAL */
	CLIENT_IGNORE_SPACE      = 256, /* Ignore spaces before '(' */
	CLIENT_PROTOCOL_41       = 512, /* New 4.1 protocol */
	CLIENT_INTERACTIVE       = 1024, /* This is an interactive client */
	CLIENT_SSL               = 2048, /* Switch to SSL after handshake */
	CLIENT_IGNORE_SIGPIPE    = 4096,    /* IGNORE sigpipes */
	CLIENT_TRANSACTIONS      = 8192, /* Client knows about transactions */
	CLIENT_RESERVED          = 16384,   /* Old flag for 4.1 protocol  */
	CLIENT_SECURE_CONNECTION = 32768,  /* New 4.1 authentication */

	CLIENT_MULTI_STATEMENTS = 65536, /* Enable/disable multi-stmt support */
	CLIENT_MULTI_RESULTS    = 131072, /* Enable/disable multi-results */
	CLIENT_PS_MULTI_RESULTS = 262144, /* Multi-results in PS-protocol */

	CLIENT_PLUGIN_AUTH = 524288, /* Client supports plugin authentication */

	CLIENT_SSL_VERIFY_SERVER_CERT = 1073741824,
	CLIENT_REMEMBER_OPTIONS       = 2147483648,
}

export enum Commands {
	// Commands
	COM_SLEEP = 0x00,
	COM_QUIT = 0x01,
	COM_INIT_DB = 0x02,
	COM_QUERY = 0x03,
	COM_FIELD_LIST = 0x04,
	COM_CREATE_DB = 0x05,
	COM_DROP_DB = 0x06,
	COM_REFRESH = 0x07,
	COM_SHUTDOWN = 0x08,
	COM_STATISTICS = 0x09,
	COM_PROCESS_INFO = 0x0a,
	COM_CONNECT = 0x0b,
	COM_PROCESS_KILL = 0x0c,
	COM_DEBUG = 0x0d,
	COM_PING = 0x0e,
	COM_TIME = 0x0f,
	COM_DELAYED_INSERT = 0x10,
	COM_CHANGE_USER = 0x11,
	COM_BINLOG_DUMP = 0x12,
	COM_TABLE_DUMP = 0x13,
	COM_CONNECT_OUT = 0x14,
	COM_REGISTER_SLAVE = 0x15,
	COM_STMT_PREPARE = 0x16,
	COM_STMT_EXECUTE = 0x17,
	COM_STMT_SEND_LONG_DATA = 0x18,
	COM_STMT_CLOSE = 0x19,
	COM_STMT_RESET = 0x1a,
	COM_SET_OPTION = 0x1b,
	COM_STMT_FETCH = 0x1c,
}

export enum Charsets {
	BIG5_CHINESE_CI              = 1,
	LATIN2_CZECH_CS              = 2,
	DEC8_SWEDISH_CI              = 3,
	CP850_GENERAL_CI             = 4,
	LATIN1_GERMAN1_CI            = 5,
	HP8_ENGLISH_CI               = 6,
	KOI8R_GENERAL_CI             = 7,
	LATIN1_SWEDISH_CI            = 8,
	LATIN2_GENERAL_CI            = 9,
	SWE7_SWEDISH_CI              = 10,
	ASCII_GENERAL_CI             = 11,
	UJIS_JAPANESE_CI             = 12,
	SJIS_JAPANESE_CI             = 13,
	CP1251_BULGARIAN_CI          = 14,
	LATIN1_DANISH_CI             = 15,
	HEBREW_GENERAL_CI            = 16,
	TIS620_THAI_CI               = 18,
	EUCKR_KOREAN_CI              = 19,
	LATIN7_ESTONIAN_CS           = 20,
	LATIN2_HUNGARIAN_CI          = 21,
	KOI8U_GENERAL_CI             = 22,
	CP1251_UKRAINIAN_CI          = 23,
	GB2312_CHINESE_CI            = 24,
	GREEK_GENERAL_CI             = 25,
	CP1250_GENERAL_CI            = 26,
	LATIN2_CROATIAN_CI           = 27,
	GBK_CHINESE_CI               = 28,
	CP1257_LITHUANIAN_CI         = 29,
	LATIN5_TURKISH_CI            = 30,
	LATIN1_GERMAN2_CI            = 31,
	ARMSCII8_GENERAL_CI          = 32,
	UTF8_GENERAL_CI              = 33,
	CP1250_CZECH_CS              = 34,
	UCS2_GENERAL_CI              = 35,
	CP866_GENERAL_CI             = 36,
	KEYBCS2_GENERAL_CI           = 37,
	MACCE_GENERAL_CI             = 38,
	MACROMAN_GENERAL_CI          = 39,
	CP852_GENERAL_CI             = 40,
	LATIN7_GENERAL_CI            = 41,
	LATIN7_GENERAL_CS            = 42,
	MACCE_BIN                    = 43,
	CP1250_CROATIAN_CI           = 44,
	UTF8MB4_GENERAL_CI           = 45,
	UTF8MB4_BIN                  = 46,
	LATIN1_BIN                   = 47,
	LATIN1_GENERAL_CI            = 48,
	LATIN1_GENERAL_CS            = 49,
	CP1251_BIN                   = 50,
	CP1251_GENERAL_CI            = 51,
	CP1251_GENERAL_CS            = 52,
	MACROMAN_BIN                 = 53,
	UTF16_GENERAL_CI             = 54,
	UTF16_BIN                    = 55,
	UTF16LE_GENERAL_CI           = 56,
	CP1256_GENERAL_CI            = 57,
	CP1257_BIN                   = 58,
	CP1257_GENERAL_CI            = 59,
	UTF32_GENERAL_CI             = 60,
	UTF32_BIN                    = 61,
	UTF16LE_BIN                  = 62,
	BINARY                       = 63,
	ARMSCII8_BIN                 = 64,
	ASCII_BIN                    = 65,
	CP1250_BIN                   = 66,
	CP1256_BIN                   = 67,
	CP866_BIN                    = 68,
	DEC8_BIN                     = 69,
	GREEK_BIN                    = 70,
	HEBREW_BIN                   = 71,
	HP8_BIN                      = 72,
	KEYBCS2_BIN                  = 73,
	KOI8R_BIN                    = 74,
	KOI8U_BIN                    = 75,
	LATIN2_BIN                   = 77,
	LATIN5_BIN                   = 78,
	LATIN7_BIN                   = 79,
	CP850_BIN                    = 80,
	CP852_BIN                    = 81,
	SWE7_BIN                     = 82,
	UTF8_BIN                     = 83,
	BIG5_BIN                     = 84,
	EUCKR_BIN                    = 85,
	GB2312_BIN                   = 86,
	GBK_BIN                      = 87,
	SJIS_BIN                     = 88,
	TIS620_BIN                   = 89,
	UCS2_BIN                     = 90,
	UJIS_BIN                     = 91,
	GEOSTD8_GENERAL_CI           = 92,
	GEOSTD8_BIN                  = 93,
	LATIN1_SPANISH_CI            = 94,
	CP932_JAPANESE_CI            = 95,
	CP932_BIN                    = 96,
	EUCJPMS_JAPANESE_CI          = 97,
	EUCJPMS_BIN                  = 98,
	CP1250_POLISH_CI             = 99,
	UTF16_UNICODE_CI             = 101,
	UTF16_ICELANDIC_CI           = 102,
	UTF16_LATVIAN_CI             = 103,
	UTF16_ROMANIAN_CI            = 104,
	UTF16_SLOVENIAN_CI           = 105,
	UTF16_POLISH_CI              = 106,
	UTF16_ESTONIAN_CI            = 107,
	UTF16_SPANISH_CI             = 108,
	UTF16_SWEDISH_CI             = 109,
	UTF16_TURKISH_CI             = 110,
	UTF16_CZECH_CI               = 111,
	UTF16_DANISH_CI              = 112,
	UTF16_LITHUANIAN_CI          = 113,
	UTF16_SLOVAK_CI              = 114,
	UTF16_SPANISH2_CI            = 115,
	UTF16_ROMAN_CI               = 116,
	UTF16_PERSIAN_CI             = 117,
	UTF16_ESPERANTO_CI           = 118,
	UTF16_HUNGARIAN_CI           = 119,
	UTF16_SINHALA_CI             = 120,
	UTF16_GERMAN2_CI             = 121,
	UTF16_CROATIAN_MYSQL561_CI   = 122,
	UTF16_UNICODE_520_CI         = 123,
	UTF16_VIETNAMESE_CI          = 124,
	UCS2_UNICODE_CI              = 128,
	UCS2_ICELANDIC_CI            = 129,
	UCS2_LATVIAN_CI              = 130,
	UCS2_ROMANIAN_CI             = 131,
	UCS2_SLOVENIAN_CI            = 132,
	UCS2_POLISH_CI               = 133,
	UCS2_ESTONIAN_CI             = 134,
	UCS2_SPANISH_CI              = 135,
	UCS2_SWEDISH_CI              = 136,
	UCS2_TURKISH_CI              = 137,
	UCS2_CZECH_CI                = 138,
	UCS2_DANISH_CI               = 139,
	UCS2_LITHUANIAN_CI           = 140,
	UCS2_SLOVAK_CI               = 141,
	UCS2_SPANISH2_CI             = 142,
	UCS2_ROMAN_CI                = 143,
	UCS2_PERSIAN_CI              = 144,
	UCS2_ESPERANTO_CI            = 145,
	UCS2_HUNGARIAN_CI            = 146,
	UCS2_SINHALA_CI              = 147,
	UCS2_GERMAN2_CI              = 148,
	UCS2_CROATIAN_MYSQL561_CI    = 149,
	UCS2_UNICODE_520_CI          = 150,
	UCS2_VIETNAMESE_CI           = 151,
	UCS2_GENERAL_MYSQL500_CI     = 159,
	UTF32_UNICODE_CI             = 160,
	UTF32_ICELANDIC_CI           = 161,
	UTF32_LATVIAN_CI             = 162,
	UTF32_ROMANIAN_CI            = 163,
	UTF32_SLOVENIAN_CI           = 164,
	UTF32_POLISH_CI              = 165,
	UTF32_ESTONIAN_CI            = 166,
	UTF32_SPANISH_CI             = 167,
	UTF32_SWEDISH_CI             = 168,
	UTF32_TURKISH_CI             = 169,
	UTF32_CZECH_CI               = 170,
	UTF32_DANISH_CI              = 171,
	UTF32_LITHUANIAN_CI          = 172,
	UTF32_SLOVAK_CI              = 173,
	UTF32_SPANISH2_CI            = 174,
	UTF32_ROMAN_CI               = 175,
	UTF32_PERSIAN_CI             = 176,
	UTF32_ESPERANTO_CI           = 177,
	UTF32_HUNGARIAN_CI           = 178,
	UTF32_SINHALA_CI             = 179,
	UTF32_GERMAN2_CI             = 180,
	UTF32_CROATIAN_MYSQL561_CI   = 181,
	UTF32_UNICODE_520_CI         = 182,
	UTF32_VIETNAMESE_CI          = 183,
	UTF8_UNICODE_CI              = 192,
	UTF8_ICELANDIC_CI            = 193,
	UTF8_LATVIAN_CI              = 194,
	UTF8_ROMANIAN_CI             = 195,
	UTF8_SLOVENIAN_CI            = 196,
	UTF8_POLISH_CI               = 197,
	UTF8_ESTONIAN_CI             = 198,
	UTF8_SPANISH_CI              = 199,
	UTF8_SWEDISH_CI              = 200,
	UTF8_TURKISH_CI              = 201,
	UTF8_CZECH_CI                = 202,
	UTF8_DANISH_CI               = 203,
	UTF8_LITHUANIAN_CI           = 204,
	UTF8_SLOVAK_CI               = 205,
	UTF8_SPANISH2_CI             = 206,
	UTF8_ROMAN_CI                = 207,
	UTF8_PERSIAN_CI              = 208,
	UTF8_ESPERANTO_CI            = 209,
	UTF8_HUNGARIAN_CI            = 210,
	UTF8_SINHALA_CI              = 211,
	UTF8_GERMAN2_CI              = 212,
	UTF8_CROATIAN_MYSQL561_CI    = 213,
	UTF8_UNICODE_520_CI          = 214,
	UTF8_VIETNAMESE_CI           = 215,
	UTF8_GENERAL_MYSQL500_CI     = 223,
	UTF8MB4_UNICODE_CI           = 224,
	UTF8MB4_ICELANDIC_CI         = 225,
	UTF8MB4_LATVIAN_CI           = 226,
	UTF8MB4_ROMANIAN_CI          = 227,
	UTF8MB4_SLOVENIAN_CI         = 228,
	UTF8MB4_POLISH_CI            = 229,
	UTF8MB4_ESTONIAN_CI          = 230,
	UTF8MB4_SPANISH_CI           = 231,
	UTF8MB4_SWEDISH_CI           = 232,
	UTF8MB4_TURKISH_CI           = 233,
	UTF8MB4_CZECH_CI             = 234,
	UTF8MB4_DANISH_CI            = 235,
	UTF8MB4_LITHUANIAN_CI        = 236,
	UTF8MB4_SLOVAK_CI            = 237,
	UTF8MB4_SPANISH2_CI          = 238,
	UTF8MB4_ROMAN_CI             = 239,
	UTF8MB4_PERSIAN_CI           = 240,
	UTF8MB4_ESPERANTO_CI         = 241,
	UTF8MB4_HUNGARIAN_CI         = 242,
	UTF8MB4_SINHALA_CI           = 243,
	UTF8MB4_GERMAN2_CI           = 244,
	UTF8MB4_CROATIAN_MYSQL561_CI = 245,
	UTF8MB4_UNICODE_520_CI       = 246,
	UTF8MB4_VIETNAMESE_CI        = 247,
	UTF8_GENERAL50_CI            = 253,

	// short aliases
	ARMSCII8 = ARMSCII8_GENERAL_CI,
	ASCII    = ASCII_GENERAL_CI,
	BIG5     = BIG5_CHINESE_CI,
	CP1250   = CP1250_GENERAL_CI,
	CP1251   = CP1251_GENERAL_CI,
	CP1256   = CP1256_GENERAL_CI,
	CP1257   = CP1257_GENERAL_CI,
	CP866    = CP866_GENERAL_CI,
	CP850    = CP850_GENERAL_CI,
	CP852    = CP852_GENERAL_CI,
	CP932    = CP932_JAPANESE_CI,
	DEC8     = DEC8_SWEDISH_CI,
	EUCJPMS  = EUCJPMS_JAPANESE_CI,
	EUCKR    = EUCKR_KOREAN_CI,
	GB2312   = GB2312_CHINESE_CI,
	GBK      = GBK_CHINESE_CI,
	GEOSTD8  = GEOSTD8_GENERAL_CI,
	GREEK    = GREEK_GENERAL_CI,
	HEBREW   = HEBREW_GENERAL_CI,
	HP8      = HP8_ENGLISH_CI,
	KEYBCS2  = KEYBCS2_GENERAL_CI,
	KOI8R    = KOI8R_GENERAL_CI,
	KOI8U    = KOI8U_GENERAL_CI,
	LATIN1   = LATIN1_SWEDISH_CI,
	LATIN2   = LATIN2_GENERAL_CI,
	LATIN5   = LATIN5_TURKISH_CI,
	LATIN7   = LATIN7_GENERAL_CI,
	MACCE    = MACCE_GENERAL_CI,
	MACROMAN = MACROMAN_GENERAL_CI,
	SJIS     = SJIS_JAPANESE_CI,
	SWE7     = SWE7_SWEDISH_CI,
	TIS620   = TIS620_THAI_CI,
	UCS2     = UCS2_GENERAL_CI,
	UJIS     = UJIS_JAPANESE_CI,
	UTF16    = UTF16_GENERAL_CI,
	UTF16LE  = UTF16LE_GENERAL_CI,
	UTF8     = UTF8_GENERAL_CI,
	UTF8MB4  = UTF8MB4_GENERAL_CI,
	UTF32    = UTF32_GENERAL_CI,
};

export enum ServerStatus {

	// Manually extracted from mysql-5.5.23/include/mysql_com.h

	/**
		Is raised when a multi-statement transaction
		has been started, either explicitly, by means
		of BEGIN or COMMIT AND CHAIN, or
		implicitly, by the first transactional
		statement, when autocommit=off.
	*/
	SERVER_STATUS_IN_TRANS          = 1,
	SERVER_STATUS_AUTOCOMMIT        = 2,  /* Server in auto_commit mode */
	SERVER_MORE_RESULTS_EXISTS      = 8,    /* Multi query - next query exists */
	SERVER_QUERY_NO_GOOD_INDEX_USED = 16,
	SERVER_QUERY_NO_INDEX_USED      = 32,
	/**
		The server was able to fulfill the clients request and opened a
		read-only non-scrollable cursor for a query. This flag comes
		in reply to COM_STMT_EXECUTE and COM_STMT_FETCH commands.
	*/
	SERVER_STATUS_CURSOR_EXISTS = 64,
	/**
		This flag is sent when a read-only cursor is exhausted, in reply to
		COM_STMT_FETCH command.
	*/
	SERVER_STATUS_LAST_ROW_SENT        = 128,
	SERVER_STATUS_DB_DROPPED           = 256, /* A database was dropped */
	SERVER_STATUS_NO_BACKSLASH_ESCAPES = 512,
	/**
		Sent to the client if after a prepared statement reprepare
		we discovered that the new statement returns a different
		number of result set columns.
	*/
	SERVER_STATUS_METADATA_CHANGED = 1024,
	SERVER_QUERY_WAS_SLOW          = 2048,

	/**
		To mark ResultSet containing output parameter values.
	*/
	SERVER_PS_OUT_PARAMS = 4096,

}