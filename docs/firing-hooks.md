---
title: Firing Hooks
order: 10
---

A hook can be "fired" in a variety of ways:

 * on a schedule
 * via the `triggerHook` API method
 * via a webhook, utilizing a security token

In each case, the hooks service creates a task based on the hook definition and
submits it to the Queue service via `Queue.createTask`.

## JSON-e Rendering

A hook definition's `task` property is, in fact, a [JSON-e](https://taskcluster.github.io/json-e/) template.
When a hook is fired, that template is rendered and the result is submitted to `Queue.createTask`.

The context for that rendering is an object with property `triggeredBy`, giving
the action that led to the hook firing. The other properties of the object vary
depending on this property.

### Scheduled Tasks

Not yet implemented (context is `{}`)

### TriggerHook

Calls to the `triggerHook` method include a payload. The payload is validated
against the hook's `triggerSchema`, and supplied in the JSON-e context as
`context`:

```
{
    triggeredBy: "triggerHook",
    context: {..}               // API call payload
}
```

The schema validation also applies any default values specified in the schema.

### Webhooks

Not yet implemented (context is `{}`)

## Task Times

The `created`, `deadline`, and `expires` attributes of the task are set
automatically, based on the relative times in `hook.deadline` and
`hook.expires`.
