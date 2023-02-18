{
  "targets": [
    {
      "target_name": "webmacro_index",
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc!": [
        "-fno-exceptions",
        "-std=c++11"
      ],
      "sources": [
        "src/index.cc",
        "src/index.h",
        "src/module.cc"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      'defines': [
        'NAPI_DISABLE_CPP_EXCEPTIONS'
      ],
    }
  ]
}
