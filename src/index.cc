#include "index.h"

namespace webmacro {

Nan::Persistent<v8::Function> CONSTRUCTOR;

void Index::ReadVariables(const std::string& uri, const std::string& text) {
  vars_[uri].clear();

  size_t n = text.length();
  bool var = false;
  std::string iden;
  for (size_t i = 0; i < n; ++i) {
    if (!isalpha(text[i])) {
      var = false;
      if (iden.length() > 1) {
        vars_[uri].insert(iden.substr(1));
        iden.clear();
      }
    }

    if (text[i] == '$') {
      var = true;
    }

    if (var) {
      iden.push_back(text[i]);
    }
  }
}

std::vector<std::string> Index::GetVariables(const std::string& uri) {
  if (!vars_.count(uri)) return {};
  return std::vector<std::string>(vars_[uri].begin(), vars_[uri].end());
}

void Index::Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->CreationContext();
  Nan::HandleScope scope;

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Index").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  Nan::SetPrototypeMethod(tpl, "getVariables", GetVariables);
  Nan::SetPrototypeMethod(tpl, "readVariables", ReadVariables);

  CONSTRUCTOR.Reset(tpl->GetFunction(context).ToLocalChecked());

  exports->Set(context,
               Nan::New("Index").ToLocalChecked(),
               tpl->GetFunction(context).ToLocalChecked());
}

void Index::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new Index(...)`
    Index* obj = new Index();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    // Invoked as plain function `Index(...)`, turn into construct call.
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = {info[0]};
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(CONSTRUCTOR);
    info.GetReturnValue().Set(
        cons->NewInstance(context, argc, argv).ToLocalChecked());
  }
}

void Index::ReadVariables(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  Index* obj = ObjectWrap::Unwrap<Index>(info.Holder());
  if (info[0]->IsUndefined() || !info[0]->IsString() || info[1]->IsUndefined() || !info[1]->IsString()) {
    return;
  }

  v8::Local<v8::String> arg1 = info[0].As<v8::String>();
  Nan::Utf8String a1(arg1);
  const char* uri = *a1;

  v8::Local<v8::String> arg2 = info[1].As<v8::String>();
  Nan::Utf8String s2(arg2);
  const char* text = *s2;

  obj->ReadVariables(uri, text);
}

void Index::GetVariables(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  Index* obj = ObjectWrap::Unwrap<Index>(info.Holder());
  if (info[0]->IsUndefined() || !info[0]->IsString()) {
    return;
  }

  v8::Local<v8::String> arg = info[0].As<v8::String>();
  Nan::Utf8String s(arg);
  const char* uri = *s;

  std::vector<std::string> vars = obj->GetVariables(uri);

  v8::Local<v8::Array> result = Nan::New<v8::Array>(vars.size());

  v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
  // Populate the v8::Array with v8::String objects
  for (uint32_t i = 0; i < vars.size(); ++i) {
    result->Set(context, i, Nan::New(vars[i]).ToLocalChecked());
  }

  info.GetReturnValue().Set(result);
}

}
