      expertise: Array.from(new Set(
        qsa("select[name^='expertise-']", form)
          .map((el) => String(el.value || "").trim())
          .filter(Boolean)
      )).filter((value) => {
        const id = String(value || "");
        if (id.startsWith("skill:")) return skillBreakdown.all.includes(id.slice(6));
        if (id === "tool:thieves_tools") return classId === "rogue" || (inventory || []).some((item) => /thieves' tools/i.test(String(item || "")));
        return false;
      }).slice(0, Number(klass.expertiseCount || 0)),
