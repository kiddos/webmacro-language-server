#include <nan.h>
#include "index.h"

void InitAll(v8::Local<v8::Object> exports) {
  webmacro::Index::Init(exports);
}

NODE_MODULE(webmacro, InitAll);
